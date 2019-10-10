var redis = require("redis"),
  subscriber = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST),
  publisher = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const {
  spawn
} = require('child_process');
var fs = require('fs');

// our subscriptions
subscriber.subscribe("front:denoise-request");
// our sends
const PUB_LOG = "denoiser:log";
const DENOISER_DONE = "denoiser:done";

publisher.publish(PUB_LOG, "hi");

const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

subscriber.on("message", function (channel, message) {
  console.log("Message '" + message + "' on channel '" + channel + "' arrived!")

  var msg = JSON.parse(message)
  var ref = msg.ref;
  var params = msg.params;
  console.log("params ", params);
  var inputPath = msg.path;
  var timestamp = Math.floor(Date.now() / 1000);
  var paramsStr = JSON.stringify(params).replace(/[':]+/g, '_').replace(/['"]+/g, '');
  var denoisedPath = inputPath + "_" + timestamp + "_" + paramsStr + ".denoised.wav";

  var convertedPath = inputPath + ".converted.wav";
  if (fs.existsSync(convertedPath)) {
    denoiseFileAndPublish(convertedPath, denoisedPath, ref, params);
  } else {
    convertToWav(inputPath, convertedPath, function () {
      denoiseFileAndPublish(convertedPath, denoisedPath, ref, params);
    })
  }
});

function convertToWav(inputPath, outputPath, cbSuccess) {
  var params = [
    '-i',
    inputPath,
    '-vn',
    '-acodec',
    'pcm_s16le',
    '-ac', 1,
    '-ar', 44100,
    '-f', 'wav',
    outputPath,
    '-n' // don't overwrite file if file already exists
  ];
  console.log("ffmpeg with params");
  console.log(params);
  var convert = spawn('ffmpeg', params);

  convert.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    var msg = {
      'ref': ref,
      'data': decoder.write(data),
      'type': 'stdout'
    };
    publisher.publish(PUB_LOG, JSON.stringify(msg));
  });

  convert.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  convert.on('close', (code) => {
    console.log(`convert process exited with code ${code}`);
    publisher.publish("audiowaveform:finished", code);
    if (code == 0 && cbSuccess) {
      cbSuccess();
    }
  });
}

function denoiseFileAndPublish(inputPath, outputPath, ref, params) {
  console.log("params ", params)
  var cmdParams = [
    'wavelet-denoiser/src/denoiser-argument.py',
    '-i', inputPath,
    '-o', outputPath,
    '-a', params.a,
    '-b', params.b,
    '-c', params.c,
    '-d', params.d,
    '-type', params.type,
    '-akg', params.akg,
    '-ako', params.ako,
    '-aks', params.aks,
    '-wavelet', params.wavelet,
    '-method', params.method,
    '-l', params.l,
    '-t', params.t
  ];
  console.log(`Denoising with params ${cmdParams}`);
  var denoiser = spawn('python3', cmdParams);

  denoiser.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    var msg = {
      'ref': ref,
      'data': decoder.write(data),
      'type': 'stdout'
    };
    publisher.publish(PUB_LOG, JSON.stringify(msg));
  });

  denoiser.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    var msg = {
      'ref': ref,
      'data': decoder.write(data),
      'type': 'stderr'
    };
    publisher.publish(PUB_LOG, JSON.stringify(msg));
  });

  denoiser.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    publisher.publish("audiowaveform:finished", code);
    if (code == 0) {
      var msg = {
        path: outputPath,
        ref: ref
      };
      publisher.publish(DENOISER_DONE, JSON.stringify(msg));
    }
  });
}