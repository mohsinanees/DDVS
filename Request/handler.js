
'use strict'
const cbor = require('cbor')
var colors = require('colors')
const ConnectionPayload = require('./ConnectionPayload')
const CredAuthorizationPayload = require('./CredAuthorizationPayload')
const CredClaimPayload = require("./CredClaimPayload")
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const {
    Request_family,
    version,
    Request_namespace,
    _genRequestAddress
} = require('./namespace')
const {
    conection_request,
    authorization_request,
    cred_claim_request
} = require("../config").request_type
var count = 0

const _setEntry = (context, address, stateValue) => {
    let entries = {
        [address]: cbor.encode(stateValue)
    }
    return context.setState(entries)
}

class RequestHandler extends TransactionHandler {
    constructor() {
        console.info(('[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +
            ' INFO\tRequest_processor]').green)
        super(Request_family, [version], [Request_namespace])
    }

    async apply(transactionProcessRequest, context) {
        let encPayload = transactionProcessRequest.payload
        let decodedData = await cbor.decode(transactionProcessRequest.payload)
        let payload
        if (decodedData.type == conection_request) {
            payload = await ConnectionPayload.fromBytes(encPayload)
        } else if (decodedData.type == authorization_request) {
            payload = await CredAuthorizationPayload.fromBytes(encPayload)
        } else if (decodedData.type == cred_claim_request) {
            payload = await CredClaimPayload.fromBytes(encPayload)
        } else {
            throw new InvalidTransaction("Unknown Request Type")
        }
        let requestAddress = _genRequestAddress(payload.requestID)
        let actionPromise
        let state = await context.getState([requestAddress])
        if (state[requestAddress].length != 0) {
            throw new InvalidTransaction("Request already exists")
        } else {
            actionPromise = _setEntry(context, requestAddress, payload)
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

}

const logger = (message, type) => {
    console.log((
        '[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' '
        + 'DEBUG' + '\tRequest_processor' + ']').green + '\n' +
        `requestID: ${message.requestID}\n` +
        `type: ${message.type}\n` +
        `SourceDid: ${message.sourceDid}\n` +
        `SourceVerKey: ${message.sourceVerKey}\n` +
        `DestDid: ${message.destDid}\n` +
        `DestVerKey: ${message.destVerKey}\n` +
        `nonce: ${message.nonce}\n`
    )
    if (type == authorization_request) {
        console.log(
            `schemaID: ${message.schemaID} \n` +
            `credentialID: ${message.credentialID}\n` +
            `credTitle: ${message.credTitle}\n` +
            `credBody: ${message.credBody} \n`
        )
    } else if (type == cred_claim_request) {
        console.log(
            `schemaID: ${message.schemaID} \n`
        )
    }
}

module.exports = RequestHandler
