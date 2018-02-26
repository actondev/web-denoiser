var redis = require("redis")
  , subscriber = redis.createClient(6379, "redis_db")
  , publisher  = redis.createClient(6379, "redis_db");

const { spawn } = require('child_process');
  

subscriber.on("message", function(channel, message) {
  console.log("Message '" + message + "' on channel '" + channel + "' arrived!")

  var targetFile = message + ".dat";

  var audiowaveform = spawn('audiowaveform', ['-i', message, '-o', targetFile]);

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
    if(code == 0){
      publisher.publish("audiowaveform:done", targetFile);
    }
  });
  
});

subscriber.subscribe("audiowaveform:file");

publisher.publish("audiowaveform:log", "hi");