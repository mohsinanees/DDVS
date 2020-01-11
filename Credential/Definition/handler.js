
'use strict'
const cbor = require('cbor')
var colors = require('colors')
const CredentialPayload = require('./payload')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const {
  credDef_family,
  version,
  credDef_namespace,
  _genCredentialAddress
} = require('./namespace')
const { _genDIDAddress } = require("../../DID/namespace")
const { _genSchemaAddress } = require("../Schema/namespace")
const {
  authorizerVerify,
  issuerVerify,
  requesterVerify,
  schemaVerify,
  requesterExist,
  setEntry
} = require("../../verify")
var count = 0

class CredentialHandler extends TransactionHandler {
  constructor() {
    console.info(('[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +
      ' INFO\tCredential_processor]').green)
    super(credDef_family, [version], [credDef_namespace])
  }

  async apply(transactionProcessRequest, context) {
    let payload = await CredentialPayload.fromBytes(transactionProcessRequest.payload)
    let header = transactionProcessRequest.header

    // state addresses to be read from
    let authorizerAddress = _genDIDAddress(payload.authorizerVerKey)
    let issuerAddress = _genDIDAddress(payload.sourceVerKey)
    let schemaAddress = _genSchemaAddress(payload.schemaID)
    let requesterAddress = _genDIDAddress(payload.destVerKey)

    // state address to be written to
    let credentialAddress = _genCredentialAddress(payload.credentialID)

    // get state value of all the entities and schema
    let result = await context.getState([authorizerAddress, issuerAddress,
      schemaAddress, requesterAddress])

    // verify authorizer, issuer, requester, schema 
    let authorizerStatus = authorizerVerify(result, authorizerAddress, payload)
    if (authorizerStatus) {
      let issuerStatus = issuerVerify(result, issuerAddress, payload)
      if (issuerStatus) {
        let schemaStatus = schemaVerify(result, schemaAddress, payload)
        if (schemaStatus) {
          let requesterStatus = requesterExist(result, requesterAddress)
          if (!requesterStatus) {
            throw new InvalidTransaction("Invalid Requester")
          }
        } else {
          throw new InvalidTransaction("Invalid Schema")
        }
      } else {
        throw new InvalidTransaction("Invalid Issuer")
      }
    } else {
      throw new InvalidTransaction("Invalid Authorizer")
    }

    // writing state value of credential
    let actionPromise = setEntry(context, credentialAddress, payload)
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
  console.log((
    '[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' '
    + 'DEBUG' + '\tCredential_processor' + ']').green + '\n' +
    `authorizerDid: ${message.authorizerDid}\n` +
    `authorizerVerKey: ${message.authorizerVerKey}\n` +
    `sourceDid: ${message.sourceDid}\n` +
    `sourceVerKey: ${message.sourceVerKey}\n` +
    `destDid: ${message.destDid}\n` +
    `destVerKey: ${message.destVerKey}\n` +
    `schemaID: ${message.schemaID} \n` +
    `schemaVersion: ${message.schemaVersion}\n` +
    `credentialID: ${message.credentialID}\n` +
    `credentialTitle: ${message.credentialTitle}\n` +
    `nonce: ${message.nonce}\n` +
    `issuerSignature: ${message.issuerSignature}\n` +
    `authorizerSignature: ${message.authorizerSignature}\n` +
    `credentialBody:\n` +
    JSON.stringify(message.credentialBody)
  )
}

module.exports = CredentialHandler
