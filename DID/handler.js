
'use strict'
var colors = require('colors')
const DIDPayload = require('./payload')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const {
  DID_FAMILY,
  VERSION,
  DID_NAMESPACE,
  _genDIDAddress
} = require('./namespace')
const {
  issuerVerify,
  requesterExist,
  setEntry
} = require("../verify")
var count = 0

class DIDHandler extends TransactionHandler {
  constructor() {
    console.info(('[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +
      ' INFO\tDID_processor]').green)
    super(DID_FAMILY, [VERSION], [DID_NAMESPACE])
  }

  async apply(transactionProcessRequest, context) {
    let payload = await DIDPayload.fromBytes(transactionProcessRequest.payload)
    let header = transactionProcessRequest.header
    let issuerAddress = _genDIDAddress(payload.sourceVerKey)
    let requesterAddress = _genDIDAddress(payload.destVerKey)
    let actionPromise

    if (payload.role != "authorizer" && payload.role != "issuer") {
      // if (IssuerAddress != '9f39ae037331e609d763219dd0b67863d021668ee585fd6663efa9ed621909f1f58ae3') {
      let res = await context.getState([issuerAddress, requesterAddress])
      // console.log(res)
      let issuerStatus = issuerVerify(res, issuerAddress, payload)
      if (issuerStatus) {
        let requesterStatus = requesterExist(res, requesterAddress)
        if (requesterStatus) {
          throw new InvalidTransaction("requester already exist")
        }
      } else {
        throw new InvalidTransaction("invalid Issuer")
      }
      //console.log("\n" + status + "\n")
    }
    actionPromise = setEntry(context, requesterAddress, payload)
    if (actionPromise) {
      if (count == 0) {
        logger(payload)
        count++
      } else {
        count = 0
      }
    }

  }

}

const logger = (message) => {
  console.log(('[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' '
    + 'DEBUG' + '\tDID_processor' + ']').green + '\n' +
    `SourceDid: ${message.sourceDid}\n` +
    `SourceVerKey: ${message.sourceVerKey}\n` +
    `DestDid: ${message.destDid}\n` +
    `DestVerKey: ${message.destVerKey}\n` +
    `nonce: ${message.nonce}\n` +
    `Signature: ${message.signature} \n` +
    `Role: ${message.role}`)
}

module.exports = DIDHandler
