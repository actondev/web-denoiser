var socket;
socket = io();

socket.on("connect", function () {
  console.log("connect")
  console.log(socket.io.engine.id)
  window.clientId = socket.io.engine.id;
})

$(function () {
  $('#form-message').submit(function () {
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  $('#denoise').click(function () {
    onDenoiseButtonClicked();
  });

  socket.on('chat message', function (msg) {
    console.log("on chat message");
    $('#messages').append($('<li> PUBLIC').text(msg));
  });

  socket.on('message', function (message) {
    console.log("message:" + message);
  });

  socket.on('front:audiowaveform-done', function (message) {
    console.log("front:audiowaveform-done:" + message);
    var msg = JSON.parse(message);
    if(msg.ref.type == 'original'){
      window.app.$refs.original.setWaveformSource(msg.path)
    }
    else if(msg.ref.type == 'denoised'){
      window.app.$refs.denoised.setWaveformSource(msg.path)      
    }
  });

  socket.on('front:denoise-done', function (message) {
    console.log("front:denoise-done:" + message);
    var msg = JSON.parse(message);
    window.app.$refs.denoised.setAudioSource(msg.path);
  });

  socket.on('audiowaveform:log', function(message){
    // console.log("audiowaveform:log ", message);
    // window.app.$refs.microservicesMonitor.audiowaveformLog(message);
  });
  socket.on('denoiser:log', function(message){
    console.log("denoiser:log ", message);
  });
  socket.on('denoiser:log', function(message){
    console.log("denoiser:log ", message);
  });

});

function onDenoiseButtonClicked() {
  console.log("onDenoiseButtonClicked")
  // send message
  var msg = {
    "ref" : window.ref
  };

  console.log(msg);

  socket.emit('web:denoise', JSON.stringify(msg));
}