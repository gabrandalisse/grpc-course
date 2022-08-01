const grpc = require("@grpc/grpc-js");
const { GreetRequest } = require("../proto/greet_pb");
const { GreetServiceClient } = require("../proto/greet_grpc_pb");

function doGreet(client) {
  console.log("doGreet was invoked");

  const req = new GreetRequest().setFirstName("Gabriel");

  client.greet(req, (err, res) => {
    if (err) return console.log(err);
    console.log(`Greet: ${res.getResult()}`);
  });
}

function doGreetManyTimes(client) {
  console.log("doGreetManyTimes was invoked");

  const req = new GreetRequest().setFirstName("Andres");

  const call = client.greetManyTimes(req);

  call.on("data", (res) => {
    console.log(`GreetManyYimes: ${res.getResult()}`);
  });
}

function doLongGreet(client) {
  console.log("doLongGreet was invoked");

  const names = ["Gabriel", "Andres", "Pedro"];

  const call = client.longGreet((err, response) => {
    if (err) return console.log(err);

    console.log(`LongGreet: ${response.getResult()}`);
  });

  names
    .map((name) => {
      return new GreetRequest().setFirstName(name);
    })
    .forEach((req) => call.write(req));

  call.end();
}

function doGreetEveryone(client) {
  console.log("doGreetEveryone was invoked");

  const names = ["Gabriel", "Andres", "Pedro"];

  const call = client.greetEveryone();

  call.on("data", (res) => {
    console.log(`GreetEveryone: ${res.getResult()}`);
  });

  names
    .map((name) => {
      return new GreetRequest().setFirstName(name);
    })
    .forEach((req) => call.write(req));

  call.end();
}

function doGreetWithDeadLine(client, ms) {
  console.log("doGreeWithDeadLine was invoked");

  const req = new GreetRequest().setFirstName('Gabriel');

  client.greetWithDeadLine(req, {deadline: new Date(Date.now() + ms)}, (err, res) => {
    if (err) return console.log(err);

    console.log(`GreetWithDeadLine: ${res.getResult()}`);
  })

}

function main() {
  const credentials = grpc.ChannelCredentials.createInsecure();
  const client = new GreetServiceClient("localhost:50051", credentials);

  // doGreet(client);
  // doGreetManyTimes(client);
  // doLongGreet(client);
  // doGreetEveryone(client);
  // doGreetWithDeadLine(client, 5000);
  doGreetWithDeadLine(client, 1000);

  client.close();
}

main();
