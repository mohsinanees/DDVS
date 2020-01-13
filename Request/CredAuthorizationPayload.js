
'use strict'

const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const cbor = require('cbor')
const { createHash } = require('crypto')

class CredAuthorizationPayload {
    constructor( type, sourceDid, sourceVerKey, destDid, destVerKey, schemaID,
                 credentialTitle, credentialBody, nonce, signature ) {
        this.type = type
        this.requestID = createHash("sha256").update(JSON.stringify([type, sourceDid,
            destDid])).digest('hex')
        this.sourceDid = sourceDid
        this.sourceVerKey = sourceVerKey
        this.destDid = destDid
        this.destVerKey = destVerKey
        this.schemaID = schemaID
        this.credentialID = createHash('sha256').update(JSON.stringify([credentialBody.student_name,
            credentialBody.student_cnic, credentialBody.level])).digest("hex")
        this.credentialTitle= credentialTitle
        this.credentialBody = credentialBody
        this.nonce = nonce
        this.signature = signature
    }

    static async fromBytes(payload) {

        let res = await cbor.decode(payload)
        if (res) {

            if (!res.type) {
                throw new InvalidTransaction('Request Type is required')
            }

            // if (!res.requestID) {
            //     throw new InvalidTransaction('Request ID is required')
            // }
            
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

            // if (!res.credentialID) {
            //     throw new InvalidTransaction('Credential ID is required')
            // }

            if (!res.credentialTitle) {
                throw new InvalidTransaction('Credential title is required')
            }

            if (!res.credentialBody) {
                throw new InvalidTransaction('Credential body is required')
            }

            if (!res.nonce) {
                throw new InvalidTransaction('Schema Version is required')
            }

            if (!res.signature) {
                throw new InvalidTransaction('signature is required')
            }

            return new CredAuthorizationPayload(res.type, res.sourceDid, res.sourceVerKey,
                 res.destDid, res.destVerKey, res.schemaID, res.credentialtitle, 
                 res.credentialBody, res.nonce, res.signature)
        } else {
            throw new InvalidTransaction('Invalid payload serialization').catch(err => {console.log(err)})
        }

    }
}

module.exports = CredAuthorizationPayload
