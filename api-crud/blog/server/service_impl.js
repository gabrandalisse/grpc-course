const grpc = require("@grpc/grpc-js");
const { ObjectId } = require("mongodb");
const { Blog, BlogId } = require("../proto/blog_pb");
const { Empty } = require("google-protobuf/google/protobuf/empty_pb");

function blogToDocument(blog) {
  return {
    author_id: blog.getAuthorId(),
    title: blog.getTitle(),
    content: blog.getContent(),
  };
}

const internal = (err, callback) =>
  callback({
    code: grpc.status.INTERNAL,
    message: err.toString(),
  });

function checkNotAcknowledged(res, callback) {
  if (res.acknowledged) {
    callback({
      code: grpc.status.INTERNAL,
      message: "operation was not acknowladged",
    });
  }
}

function checkOID(id, callback) {
  try {
    return new ObjectId(id);
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Invalid OID",
    });
  }
}

function checkNotFound(result, callback) {
  if (!result || result.matchedCount == 0 || result.deleteCount == 0)
    callback({
      code: grpc.status.NOT_FOUND,
      message: "blog not found",
    });
}

function documentToBlog(doc) {
  return new Blog()
    .setId(doc._id.toString())
    .setAuthorId(doc.author_id)
    .setTitle(doc.title)
    .setContent(doc.content);
}

exports.createBlog = async (call, callback) => {
  console.log("createBlog was invoked");

  const data = blogToDocument(call.request);

  await collection
    .insertOne(data)
    .then((res) => {
      // checkNotAcknowledged(res, callback);

      const id = res.insertedId.toString();
      const blogId = new BlogId().setId(id);

      callback(null, blogId);
    })
    .catch((err) => internal(err, callback));
};

exports.readBlog = async (call, callback) => {
  console.log("readBlog was invoked");

  const oid = checkOID(call.request.getId(), callback);

  await collection
    .findOne({ _id: oid })
    .then((res) => {
      checkNotFound(res, callback);
      callback(null, documentToBlog(res));
    })
    .catch((err) => internal(err, callback));
};

exports.updateBlog = async (call, callback) => {
  console.log("updateBlog was invoked");

  const oid = checkOID(call.request.getId(), callback);

  await collection
    .updateOne({ _id: oid }, { $set: blogToDocument(call.request) })
    .then((res) => {
      checkNotFound(res, callback);
      callback(null, new Empty());
    })
    .catch((err) => internal(err, callback));
};

exports.listBlogs = async (call, callback) => {
  console.log("listBlogs was invoked");

  await collection
    .find()
    .map((doc) => documentToBlog(doc))
    .forEach((blog) => call.write(blog))
    .then(() => call.end())
    .catch((err) =>
      call.destroy({
        code: grpc.status.INTERNAL,
        message: "could not list blogs",
      })
    );
};

exports.deleteBlog = async (call, callback) => {
  console.log("deleteBlog was invoked");

  const oid = checkOID(call.request.getId(), callback);

  await collection
    .deleteOne({ _id: oid })
    .then((res) => {
      checkNotFound(res, callback);
      callback(null, new Empty());
    })
    .catch((err) => internal(err, callback));
};
