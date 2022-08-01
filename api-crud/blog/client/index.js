const grpc = require("@grpc/grpc-js");
const { Blog, BlogId } = require("../proto/blog_pb");
const { BlogServiceClient } = require("../proto/blog_grpc_pb");
const { Empty } = require("google-protobuf/google/protobuf/empty_pb");

function createBlog(client) {
  console.log("createBlog was invoked");

  return new Promise((resolve, reject) => {
    const req = new Blog()
      .setAuthorId("Gabriel")
      .setTitle("My First Blog")
      .setContent("Content of the first blog: test 1");

    client.createBlog(req, (err, res) => {
      if (err) reject(err);

      console.log(`Blog was created: ${res}`);
      resolve(res.getId());
    });
  });
}

function readBlog(client, id) {
  console.log("readBlog was invoked");

  return new Promise((resolve, reject) => {
    const req = new BlogId().setId(id);

    client.readBlog(req, (err, res) => {
      if (err) reject(err);

      console.log(`Blog was read: ${res}`);
      resolve();
    });
  });
}

function updateBlog(client, id) {
  console.log("updateBlog was invoked");

  return new Promise((resolve, reject) => {
    const req = new Blog()
      .setId(id)
      .setAuthorId("Not Gabriel")
      .setTitle("My First Blog Updated")
      .setContent("Updated blog content");

    client.updateBlog(req, (err, res) => {
      if (err) reject(err);

      console.log(`Blog was updated`);
      resolve();
    });
  });
}

function listBlogs(client) {
  console.log("listsBlogs was invoked");

  return new Promise((resolve, reject) => {
    const req = new Empty();
    const call = client.listBlogs(req);

    call.on("data", (res) => console.log("Res", res));
    call.on("error", (err) => reject(err));
    call.on("end", () => resolve());
  });
}

function deleteBlog(client, id) {
  console.log("deleteBlog was invoked");

  return new Promise((resolve, reject) => {
    const req = new BlogId().setId(id);

    client.deleteBlog(req, (err, res) => {
      if (err) reject(err);

      console.log("Blog was deleted");
      resolve();
    });
  });
}

async function main() {
  const credentials = grpc.ChannelCredentials.createInsecure();
  const client = new BlogServiceClient("localhost:50051", credentials);

  const id = await createBlog(client);
  await readBlog(client, id);
  await updateBlog(client, id);
  await listBlogs(client);
  await deleteBlog(client, id);

  client.close();
}

main();
