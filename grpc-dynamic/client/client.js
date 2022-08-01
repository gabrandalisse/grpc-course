const path = require("path");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

// grpc service definition for greet
const greetProtoPath = path.join(__dirname, "..", "protos", "greet.proto");
const greetProtoDefinition = protoLoader.loadSync(greetProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const greetPackageDefinition =
  grpc.loadPackageDefinition(greetProtoDefinition).greet;

const client = new greetPackageDefinition.GreetService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

function callGreetings() {
  const request = {
    greeting: {
      first_name: "Gabriel",
      last_name: "Branda",
    },
  };

  client.greet(request, (error, response) => {
    if (error) console.log("Request Error", error);
    console.log("Greeting Response: ", response.result);
  });
}

function main() {
  callGreetings;
}

main();
