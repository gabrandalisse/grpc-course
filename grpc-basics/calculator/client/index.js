const grpc = require("@grpc/grpc-js");
const { SumRequest } = require("../proto/sum_pb");
const { AvgRequest } = require("../proto/avg_pb");
const { MaxRequest } = require("../proto/max_pb");
const { SqrtRequest } = require("../proto/sqrt_pb");
const { PrimeRequest } = require("../proto/prime_pb");
const { CalculatorServiceClient } = require("../proto/calculator_grpc_pb");

function doSum(client) {
  console.log("doSum was invoked");

  const req = new SumRequest().setFirstNumber(2).setSecondNumber(2);

  client.sum(req, (err, res) => {
    if (err) return console.log(err);
    console.log(`The sum is: ${res.getResult()}`);
  });
}

function doPrime(client) {
  console.log("doPrime was invoked");

  const request = new PrimeRequest().setRequestNumber(120);
  const call = client.prime(request);

  call.on("data", (res) => {
    console.log(`PrimeDescomposition: ${res.getResult()}`);
  });
}

function doAvg(client) {
  console.log("doAvg was invoked");

  const numbers = [1, 2, 3, 4];

  const call = client.avg((err, res) => {
    if (err) return console.log(err);

    console.log(`AVG Response: ${res.getResult()}`);
  });

  numbers
    .map((number) => {
      return new AvgRequest().setRequestNumber(number);
    })
    .forEach((req) => call.write(req));

  call.end();
}

function doMax(client) {
  console.log("doMax was invoked");

  const numbers = [1, 5, 3, 6, 2, 20];

  const call = client.max();

  numbers
    .map((number) => {
      return new MaxRequest().setRequestNumber(number);
    })
    .forEach((req) => call.write(req));

  call.on("data", (res) => {
    console.log(`Max: ${res.getResult()}`);
  });

  call.end();
}

function doSqrt(client, n) {
  console.log('doSqrt was invoked');

  const request  = new SqrtRequest().setNumber(n);

  client.sqrt(request, (err, res) => {
    if (err) console.log('ERROR', err);
    console.log(`SQRT Response: ${res.getResult()}`);
  })

}

function main() {
  const credentials = grpc.ChannelCredentials.createInsecure();
  const client = new CalculatorServiceClient("localhost:50051", credentials);

  // doSum(client);
  // doPrime(client);
  // doAvg(client);
  // doMax(client);
  // doSqrt(client, 25);
  doSqrt(client, -1);

  client.close();
}

main();
