
'use strict'
const cbor = require('cbor')
var colors = require('colors')
const SchemaPayload = require('./payload')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')

const {
  schema_family,
  version,
  schema_namespace,
  _genSchemaAddress
} = require('./namespace')

const {
  authorizerVerify,
  setEntry
} = require('../../verify')

const { _genDIDAddress } = require("../../DID/namespace")
var count = 0

class SchemaHandler extends TransactionHandler {
  constructor() {
    console.info(('[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +
      ' INFO\tSchema_processor]').green)
    super(schema_family, [version], [schema_namespace])
  }

  async apply(transactionProcessRequest, context) {
    let payload = await SchemaPayload.fromBytes(transactionProcessRequest.payload)
    let header = transactionProcessRequest.header
    let authorAddress = _genDIDAddress(payload.sourceVerKey)
    let schemaAddress = _genSchemaAddress(payload.schemaID)
    let actionPromise
    let res = await context.getState([authorAddress, schemaAddress])

    let status = authorizerVerify(res, authorAddress, payload)
    if (status) {
      actionPromise = setEntry(context, schemaAddress, payload)
      if (actionPromise) {
        if (count == 0) {
          logger(payload)
          count++
        } else {
          count = 0
        }
      }
    } else {
      throw new InvalidTransaction("Invalid Authorizer")
    }
  }
}


const logger = (message) => {
  console.log(('[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' '
    + 'DEBUG' + '\tSchema_processor' + ']').green + '\n' +
    `sourceDid: ${message.sourceDid}\n` +
    `sourceVerKey: ${message.sourceVerKey}\n` +
    `schemaID: ${message.schemaID}\n` +
    `version: ${message.version}\n` +
    `title: ${message.title}\n` +
    `nonce: ${message.nonce}\n` +
    `signature: ${message.signature} \n` +
    JSON.stringify(message.attributes)
    )
}

module.exports = SchemaHandler
