const grpc = require('@grpc/grpc-js');
const { SumResponse } = require("../proto/sum_pb");
const { AvgResponse } = require("../proto/avg_pb");
const { MaxResponse } = require("../proto/max_pb");
const { SqrtResponse } = require("../proto/sqrt_pb");
const { PrimeResponse } = require("../proto/prime_pb");

exports.sum = (call, callback) => {
  console.log("sum was invoked");

  const sumResult =
    call.request.getFirstNumber() + call.request.getSecondNumber();
  const response = new SumResponse().setResult(sumResult);

  callback(null, response);
};

exports.prime = (call, _) => {
  console.log("prime was invoked");

  const result = new PrimeResponse();

  let k = 2;
  let N = call.request.getRequestNumber();

  while (N > 1) {
    if (N % k == 0) {
      result.setResult(k);
      call.write(result);

      N = N / k;
    } else {
      k = k + 1;
    }
  }

  call.end();
};

exports.avg = (call, callback) => {
  console.log("avg was invoked");

  const numbers = [];

  call.on("data", (req) => {
    numbers.push(req.getRequestNumber());
  });

  call.on("end", () => {
    const avgResult =
      numbers.reduce((partialSum, a) => partialSum + a, 0) / numbers.length;

    const result = new AvgResponse().setResult(avgResult);

    callback(null, result);
  });
};

exports.max = (call, _) => {
  console.log("max was invoked");
  let max = 0;

  call.on("data", (req) => {
    const number = req.getRequestNumber();

    if (number > max) {
      const res = new MaxResponse().setResult(number);
      call.write(res);

      max = number;
    }
  });

  call.on("end", () => call.end());
};

exports.sqrt = (call, callback) => {
  console.log("sqrt was invoked");

  const number = call.request.getNumber();

  if (number < 0) {
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Number cannot be negative'
    });
  }

  const response = new SqrtResponse().setResult(Math.sqrt(number));
  callback(null, response);
}