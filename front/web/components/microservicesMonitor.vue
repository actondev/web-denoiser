<template>
  <q-modal v-model="show" maximized :content-css="{padding: '50px'}">
    <h2 class='q-heading text-center'>
      A wavelet denoiser with a touch of microservices.
    </h2>
    <div class='row justify-center gutter-md'>
      <div class='col-4'>
        <q-card>
          <q-card-title class='text-center'>
            front
          </q-card-title>
          <q-card-separator></q-card-separator>
          <q-card-main>
            <ul>
              <li>Web sockets</li>
            </ul>
          </q-card-main>
        </q-card>
      </div>
      <div class='col-4'>
        <q-card>
          <q-card-title class='text-center'>
            audiowaveform
          </q-card-title>
          <q-card-separator></q-card-separator>
          <q-card-main>
            <ul>
              <li v-for="item in logsPerMicroservice.audiowaveform">
                {{ item }}
              </li>
            </ul>
          </q-card-main>
        </q-card>
      </div>
      <div class='col-4'>
        <q-card>
          <q-card-title class='text-center'>
            denoiser
          </q-card-title>
          <q-card-separator></q-card-separator>
          <q-card-main>
            <ul>
              <li>Node.js calling the python denoiser</li>
            </ul>
          </q-card-main>
        </q-card>
      </div>
    </div>

    <q-btn color="tertiary" @click="closeClicked" label="Close" />
  </q-modal>
</template>

<script>
import * as QuasarComponents from "quasar-framework";
import { Notify } from 'quasar-framework'
export default {
  data() {
    return {
      show: false,
      logsPerMicroservice: {
        front: ["test1", "test2"],
        audiowaveform: ["test1", "test2"],
        denoiser: ["test1", "test2"]
      },
      timer: null,
    };
  },
  methods: {
    log(channel, message) {
      this.logsPerMicroservice[channel].push(message);
    },
    closeClicked() {
      console.log("close clicked");
      this.show = false;
    },
    audiowaveformLog(message) {
      console.log("audiowaveformLog " + message);
      var msg = JSON.parse(message);
      this.logsPerMicroservice.audiowaveform.push(msg.data);
      // this.show = true;
      // let that = this;
      // clearTimeout(this.timer);
      // this.timer = setTimeout(function(){
      //   that.show = false;
      //   console.log("hereee");

      // }, 2000);
    },
    denoiserLog(message) {
      console.log("denoiserLog " + message);
    },
    frontLog(message) {
      console.log("frontLog " + message);
    }
  },
  components: QuasarComponents
};
</script>