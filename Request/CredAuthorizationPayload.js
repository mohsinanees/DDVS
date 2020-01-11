
'use strict'

const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const cbor = require('cbor')

class CredAuthorizationPayload {
    constructor( type, requestID, sourceDid, sourceVerKey, destDid, destVerKey, schemaID,
                 credentialID, credTitle, credBody, nonce ) {
        this.type = type
        this.requestID = requestID
        this.sourceDid = sourceDid
        this.sourceVerKey = sourceVerKey
        this.destDid = destDid
        this.destVerKey = destVerKey
        this.schemaID = schemaID
        this.credentialID = credentialID
        this.credTitle= credTitle
        this.credBody = credBody
        this.nonce = nonce
    }

    static async fromBytes(payload) {

        let res = await cbor.decode(payload)
        if (res) {

            if (!res.type) {
                throw new InvalidTransaction('Request Type is required')
            }

            if (!res.requestID) {
                throw new InvalidTransaction('Request ID is required')
            }
            
            if (!res.sourceDid) {
                throw new InvalidTransaction('SourceDid is required')
            }

            if (!res.sourceVerKey) {
                throw new InvalidTransaction('SourceVerKey is required')
            }

            if (!res.destDid) {
                throw new InvalidTransaction('DestDid is required')
            }

            if (!res.destVerKey) {
                throw new InvalidTransaction('DestVerKey is required')
            }

            if (!res.schemaID) {
                throw new InvalidTransaction('Schema ID is required')
            }

            if (!res.credentialID) {
                throw new InvalidTransaction('Credential ID is required')
            }

            if (!res.credTitle) {
                throw new InvalidTransaction('Credential title is required')
            }

            if (!res.credBody) {
                throw new InvalidTransaction('Credential body is required')
            }

            if (!res.nonce) {
                throw new InvalidTransaction('Schema Version is required')
            }

            return new CredAuthorizationPayload(res.type, res.requestID,  res.sourceDid, res.sourceVerKey,
                 res.destDid, res.destVerKey, res.schemaID, res.credentialID, res.credentialtitle, res.credentialBody,
                 res.nonce )
        } else {
            throw new InvalidTransaction('Invalid payload serialization').catch(err => {console.log(err)})
        }

    }
}

module.exports = CredAuthorizationPayload
