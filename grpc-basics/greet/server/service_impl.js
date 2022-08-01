const pb = require("../proto/greet_pb");

// The call allow us to get the request properties
// The callback allow us to send a response
exports.greet = (call, callback) => {
  console.log("greet was invoked");

  const res = new pb.GreetResponse().setResult(
    `Hello ${call.request.getFirstName()}`
  );

  callback(null, res);
};

exports.greetManyTimes = (call, _) => {
  console.log("greetManyTimes was invoked");

  const res = new pb.GreetResponse();

  for (let i = 0; i < 10; i++) {
    res.setResult(`Hello ${call.request.getFirstName()} - number ${i}`);
    call.write(res);
  }

  call.end(); // This specifies the end of the streaming
};

exports.longGreet = (call, callback) => {
  console.log("longGreet was invoked");

  let greet = "";

  call.on("data", (req) => {
    greet += `Hello ${req.getFirstName()}`;
  });

  call.on("end", () => {
    const res = new pb.GreetResponse().setResult(greet);

    callback(null, res);
  });
};

exports.greetEveryone = (call, _) => {
  console.log('greetEveryone was invoked');

  call.on("data", (req) => {
    console.log('received request', req);

    const res = new pb.GreetResponse().setResult(`Hello ${req.getFirstName()}`);

    console.log('sending response', res);

    call.write(res);
  });

  call.on("end", () => call.end());
}

exports.greetWithDeadLine = async (call, callback) => {
  console.log('greewWithDeadLine was invoked');

  for (let i = 0; i < 3 ; i++) {
    if (call.cancelled) {
      return console.log('the client cancelled the request');
    }

    await sleep(1000);
  }

  const res = new pb.GreetResponse().setResult(`Hello ${call.request.getFirstName()}`);

  callback(null, res);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));