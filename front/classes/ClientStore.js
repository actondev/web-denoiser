"use strict";

var uuidv1 = require('uuid/v1');
var _ = require('lodash');

module.exports = class ClientStore {
  constructor(db) {
    this.clients = [];
  }

  addClient(clientId) {
    // console.log("addClient, socket: ", socket);
    var entry = {
      clientId: clientId,
      date: new Date(),
      refs: [],
      audioPath: null
    }

    this.clients.push(entry);
  }

  attachRefToClient(clientId, refInfo = {}) {
    var client = this.findForClientId(clientId);
    if (!client) retunr;
    var newRef = { id: uuidv1()};
    newRef = Object.assign(newRef, refInfo);
    client.refs.push(newRef);
    console.log(this.clients);

    return newRef;
  }

  findForClientId(clientId) {
    let clients = _.find(this.clients, { clientId: clientId });
    return clients;
  }

  setAudioPathForClient(clientId, audioPath) {
    var client = this.findForClientId(clientId);
    if (client)
      client.audioPath = audioPath;

    console.log("set audio, not the  clients are", this.clients);
  }

  getAudioPathForClient(clientId) {
    var client = this.findForClientId(clientId);
    if (client)
      return client.audioPath;

    return null;
  }

  getClientIdByRef(ref) {

    let client = _.find(this.clients, {'refs': [ref]});
    console.log(`client for ref  ${ref} is `, client);

    return client.clientId;
  }
}