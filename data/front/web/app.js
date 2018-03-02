import SingleFileComponent from './component.js';

Vue.config.devtools = true
window.app = new Vue({
  el: '#app',
  components: {
    'waveform': SingleFileComponent
  }
});
