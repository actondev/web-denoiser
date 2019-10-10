var redis = require("redis")
  , subscriber = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST)
  , publisher = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const { spawn } = require('child_process');

const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

// our sends
const PUB_AUDIOWAVEFORM_DONE = "audiowaveform:done";
const PUB_LOG = "audiowaveform:log";

// our subscriptions
const SUB_WAVEFORM_ANALYSIS_REQUEST = "front:waveform-analysis-request";
const SUB_FRONT_STATUS_CHECK = "front:status-check";
subscriber.subscribe(SUB_WAVEFORM_ANALYSIS_REQUEST);
subscriber.subscribe(SUB_FRONT_STATUS_CHECK);


publisher.publish("audiowaveform:log", "hi");

subscriber.on("message", function (channel, message) {
  console.log("Message '" + message + "' on channel '" + channel + "' arrived!")
  switch (channel) {
    case SUB_WAVEFORM_ANALYSIS_REQUEST: {
      onWaveformAnalysisRequest(message);
      break;
    }
    case SUB_FRONT_STATUS_CHECK: {
      onFrontStatusCheck(message);

      break;
    }
    default: {
      break;
    }
  }
});

function onFrontStatusCheck(message) {
  var msg = JSON.parse(message);
  msg.data = "hello world! I'm alive";
  publisher.publish(PUB_LOG, JSON.stringify(msg));
}

function onWaveformAnalysisRequest(message) {
  var msg = JSON.parse(message)
  var ref = msg.ref;
  var inputPath = msg.path;

  var outputPath = inputPath + ".dat";
  var command = [
    'audiowaveform',
    ['-i', inputPath, '-o', outputPath, '-b', 8]
  ];
  var audiowaveform = spawn(...command);

  var msg = {
    'ref': ref,
    'data': `running command ${command}`,
    'type': 'info'
  };

  publisher.publish(PUB_LOG, JSON.stringify(msg));

  audiowaveform.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    var msg = {
      'ref': ref,
      'data': decoder.write(data),
      'type': 'stdout'
    };
    publisher.publish(PUB_LOG, JSON.stringify(msg));
  });

  audiowaveform.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    var msg = {
      'ref': ref,
      'data': decoder.write(data),
      'type': 'stderr'
    };
    publisher.publish(PUB_LOG, JSON.stringify(msg));
  });

  audiowaveform.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    publisher.publish(PUB_LOG, `child process exited with code ${code}`);
    if (code == 0) {
      var msg = {
        path: outputPath,
        ref: ref
      };
      publisher.publish(PUB_AUDIOWAVEFORM_DONE, JSON.stringify(msg));
    }
  });
}