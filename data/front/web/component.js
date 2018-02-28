export default {
  template: `
    <div>
     <canvas :id="id" width="240" height="100"></canvas>
     <p>{{ message }} {{id}}</p>
    </div>
  `,
  data() {
    return {
      message: 'Oh hai from the component',
      id: null
    }
  },
  mounted () {
    this.id = this._uid
  }
}
