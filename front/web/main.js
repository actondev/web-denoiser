import Vue from 'vue'
import Quasar, * as QuasarComponents from 'quasar-framework';
import AudioWithWaveform from './components/audioWithWaveform.vue'
import DenoiserOptions from './components/denoiserOptions.vue'
import MicroservicesMonitor from './components/microservicesMonitor'

Vue.use(Quasar, {
  plugins: [
    QuasarComponents.Notify
  ]
});

var myComponents = {
  'audio-with-waveform': AudioWithWaveform,
  'denoiser-options': DenoiserOptions,
  'microservices-monitor': MicroservicesMonitor,
};

var components = Object.assign(myComponents, QuasarComponents)
console.log(components)

console.log("Quasar: " + Quasar.version)
window.app = new Vue({
  el: '#app',
  components: components,
  data: {
    denoiserTimeSelection: "",
    version: Quasar.version,
    uploadUrl: "",
  },
  computed: {
  },
  mounted: function () {
  },
  methods: {
    debugAudioWaveformDrawing() {
      this.$refs.stepper.goToStep("denoise");
      var that = this;
      setTimeout(function () {
        that.$refs.original.setAudioSource("/shared/noised.wav");
        that.$refs.original.setWaveformSource("/shared/noised.wav.dat");
      }, 100)
    },
    fileAdded(){
      this.$refs.uploader.upload();
    },
    setDenoiseTimeSelection(timeSelection) {
      this.denoiserTimeSelection = timeSelection;
    },
    clearDenoiserTimeSelection(){
      this.denoiserTimeSelection = "";
      this.$refs.original.clearTimeSelection();
    },
    async getUploadUrl() {
      console.log("getUploadUrl");
      console.log(window.clientId)
      var url = '/upload/' + window.clientId;
      console.log(url);
      this.uploadUrl = url;
      return url;
    },
    uploadFinish(file, xhr) {
      console.log("upload finish")
      console.log(xhr)
      this.$refs.stepper.goToStep("denoise")
      var msg = JSON.parse(xhr.response);
      var path = msg.path;
      var ref = msg.ref;
      window.ref = ref;
      setTimeout(function () {
        console.log("timeout " + path);
        window.app.$refs.original.setAudioSource(path);
      }, 200);
    }
  }
});

if (module.hot) {
  module.hot.accept();
}
