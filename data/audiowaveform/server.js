var redis = require("redis")
  , subscriber = redis.createClient(6379, "redis_db")
  , publisher = redis.createClient(6379, "redis_db");
const { spawn } = require('child_process');

// our subscriptions
subscriber.subscribe("front:file-uploaded");
// our sends
const AUDIOWAVEFORM_DONE = "audiowaveform:done";

publisher.publish("audiowaveform:log", "hi");


subscriber.on("message", function (channel, message) {
  console.log("Message '" + message + "' on channel '" + channel + "' arrived!")

  var msg = JSON.parse(message)
  var ref = msg.ref;
  var inputPath = msg.path;

  var outputPath = inputPath + ".dat";

  var audiowaveform = spawn('audiowaveform', ['-i', inputPath, '-o', outputPath]);

  audiowaveform.stdout.on('data', (data) => {
    console.log(`stderr: ${data}`);
    publisher.publish("audiowaveform:stdout", data)
  });

  audiowaveform.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    publisher.publish("audiowaveform:stderr", data)

  });

  audiowaveform.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    publisher.publish("audiowaveform:finished", code);
    if (code == 0) {
      var msg = {
        path: outputPath,
        ref: ref
      };
      publisher.publish("audiowaveform:done", JSON.stringify(msg));
    }
  });

});