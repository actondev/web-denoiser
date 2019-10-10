<template>
  <div>

    <q-card>
      <q-card-title>
        Denoiser Options
      </q-card-title>
      <q-card-main>
        <div class="row gutter-md">
          <div class="col-6">
            <q-card>
              <q-card-title>
                Noise region
              </q-card-title>
              <q-card-main>
                <div v-if="denoiserTimeSelection">
                  <q-chip @hide=clearNoiseRegion closable>{{denoiserTimeSelection}}</q-chip>
                </div>
                <div v-else>
                  Using automatic noise estimation. To define the noise region yourself, highlight it in the waveform above by click & dragging with your mouse.
                </div>
              </q-card-main>
            </q-card>
            <div class="q-pa-sm"></div>
            <q-card>
              <q-card-title>
                Ak filter
              </q-card-title>
              <q-card-main>
                <q-field label="Ak filter slope" label-width="3" helper="This controls the slope of the Ak filter. Desc (the default) means that it will atenuate higher wavelet values">
                  <q-btn-toggle v-model="params.aks" toggle-color="primary" :options="[
                    {label: 'asc', value: 'asc'},
                    {label: 'desc', value: 'desc'}
                    ]" />
                </q-field>
                <q-field label-width=3 label="Ak filter grad" helper="Ak grad explanation">
                  <q-slider v-model="params.akg" :min="0" :max="10" label-always snap markers/>
                </q-field>

                <q-field label-width=3 label="Ak filter offset" helper="Ak filter offset explanation">
                  <q-slider v-model="params.ako" :min="0" :max="10" label-always snap markers/>
                </q-field>
              </q-card-main>
            </q-card>

          </div>
          <div class="col-6">
            <q-card>
              <q-card-title>
                Paremeters
              </q-card-title>
              <q-card-main>
                <q-item>
                  <q-item-side left>
                    A
                    <q-chip>{{params.a}}</q-chip>
                  </q-item-side>
                  <q-item-main>
                    <q-slider v-model="params.a" :min="0" :max="10" label snap markers/>
                  </q-item-main>
                </q-item>

                <q-item>
                  <q-item-side left>
                    B
                    <q-chip>{{params.b}}</q-chip>
                  </q-item-side>
                  <q-item-main>
                    <q-slider v-model="params.b" :min="0" :max="10" label snap markers/>
                  </q-item-main>
                </q-item>

                <q-item>
                  <q-item-side left>
                    C
                    <q-chip>{{params.c}}</q-chip>
                  </q-item-side>
                  <q-item-main>
                    <q-slider v-model="params.c" :min="0" :max="10" label snap markers/>
                  </q-item-main>
                </q-item>

                <q-item>
                  <q-item-side left>
                    D
                    <q-chip>{{params.d}}</q-chip>
                  </q-item-side>
                  <q-item-main>
                    <q-slider v-model="params.d" :min="0.05" :max="1" :step="0.01" label/>
                  </q-item-main>
                </q-item>

              </q-card-main>
            </q-card>
            <div class="q-pa-sm"></div>
            <q-card>
              <q-card-title>
                Other
              </q-card-title>
              <q-card-main>
                <q-item>
                  <q-field label="Filter type" label-width="5" helper="Filter type I is the simple filter. In type II the output is fed again">
                    <q-btn-toggle v-model="params.type" toggle-color="primary" :options="[
                      {label: 'Type I', value: '1'},
                      {label: 'Type II', value: '2'}
                      ]" />
                  </q-field>
                </q-item>

                <q-item>
                  <q-field label="Wavelet" label-width="5" helper="The wavelet to use.">
                      <q-select
                        v-model="params.wavelet"
                        radio
                        :options="wavelets"
                      />
                </q-field>
                </q-item>

                <q-item>
                  <q-field label="Wavelet method" label-width="5" helper="Wavelet Packet Analysis or Discrete Wavelet Transofrm">
                    <q-btn-toggle v-model="params.method" toggle-color="primary" :options="[
                      {label: 'WPA', value: 'wpa'},
                      {label: 'DWT', value: 'dwt'},
                      ]" />
                  </q-field>
                </q-item>

                <q-item v-if="params.method === 'wpa'">
                  <q-field label="Decomposition levels" label-width="5" helper="The levels of the wavelet packet decomposition">
                    <q-btn-toggle v-model="params.l" toggle-color="primary" :options="[
                      {label: '6', value: '6'},
                      {label: '8', value: '8'},
                      ]" />
                  </q-field>
                </q-item>

              </q-card-main>
            </q-card>

          </div>

        </div>

      </q-card-main>

      <q-card-actions align="center">
        <q-btn color="secondary" ref="denoise" @click="denoise()" label="Denoise" icon-right="done"></q-btn>

      </q-card-actions>
    </q-card>
  </div>

</template>

<script>
import * as QuasarComponents from "quasar-framework";

export default {
  data() {
    return {
      params: {
        a: 2,
        b: 1,
        c: 1,
        d: 0.1,
        type: "2",
        akg: 4,
        ako: 2,
        aks: "asc",
        l: "8",
        wavelet: "db8",
        method: "wpa"
      },
      wavelets: [
        {
          label: "Haar",
          value: "haar"
        },
        {
          label: "Daubechies 6",
          value: "db6"
        },
        {
          label: "Daubechies 8",
          value: "db8"
        },
        {
          label: "Symlets 16",
          value: "sym16"
        },
        {
          label: "Symlets 18",
          value: "sym18"
        },
        {
          label: "Coiflets 8",
          value: "coif8"
        },
        {
          label: "Coiflets 18",
          value: "coif16"
        },
        {
          label: "FIR approximation of Meyer wavelet",
          value: "dmey"
        }
      ]
    };
  },
  components: QuasarComponents,
  props: ["denoiserTimeSelection"],
  mounted() {
    this.$refs.denoise.click = function() {};
  },
  methods: {
    denoise() {
      console.log("denoise button clicked");
      this.params.t = this.denoiserTimeSelection;
      var msg = {
        ref: window.ref,
        params: this.params
      };
      console.log(msg);

      socket.emit("web:denoise", JSON.stringify(msg));
    },
    clearNoiseRegion() {
      this.$emit("clearnoiseregion");
    }
  }
};
</script>