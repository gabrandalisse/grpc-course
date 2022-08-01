const grpc = require("@grpc/grpc-js");
const serviceImplementation = require("./service_imp");
const { CalculatorServiceService } = require("../proto/calculator_grpc_pb");

const ADDR = "localhost:50051";

function cleanup(server) {
  console.log("cleanup");
  if (server) server.forceShutdown();
}

function main() {
  const server = new grpc.Server();
  const credentials = grpc.ServerCredentials.createInsecure();

  // Stop the server execution when CTRL+C is detected
  process.on("SIGINT", () => {
    console.log("caught interrupt signal");
    cleanup(server);
  });

  server.addService(CalculatorServiceService, serviceImplementation);

  // Starts the server, if there is an error stop the execution
  server.bindAsync(ADDR, credentials, (err, _) => {
    if (err) return cleanup(server);
    server.start();
  });

  console.log("listening on ", ADDR);
}

main();
