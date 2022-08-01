const grpc = require("@grpc/grpc-js");
const { MongoClient } = require("mongodb");
const serviceImplementation = require("./service_impl");
const { BlogServiceService } = require("../proto/blog_grpc_pb");

const ADDR = "localhost:50051";
const uri = "mongodb://root:root@localhost:27017/";
const mongoClient = new MongoClient(uri);

global.collection = null;

async function cleanup(server) {
  console.log("cleanup");
  if (server) {
    await mongoClient.close();
    server.forceShutdown();
  }
}

async function main() {
  const server = new grpc.Server();
  const credentials = grpc.ServerCredentials.createInsecure();

  // Stop the server execution when CTRL+C is detected
  process.on("SIGINT", () => {
    console.log("caught interrupt signal");
    cleanup(server);
  });

  await mongoClient.connect();
  const database = mongoClient.db("blogdb");
  collection = database.collection("blog");

  server.addService(BlogServiceService, serviceImplementation);

  // Starts the server, if there is an error stop the execution
  server.bindAsync(ADDR, credentials, (err, _) => {
    if (err) return cleanup(server);
    server.start();
  });

  console.log("listening on ", ADDR);
}

main().catch(cleanup);
