
'use strict'

const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const cbor = require('cbor')
const { createHash } = require('crypto')

class CredClaimPayload {
    constructor( type, sourceDid, sourceVerKey, destDid, destVerKey, 
        nonce, signature) {
        this.type = type
        this.requestID = createHash("sha256").update(JSON.stringify([this.type, this.sourceDid,
            this.destDid])).digest('hex')
        this.sourceDid = sourceDid
        this.sourceVerKey = sourceVerKey
        this.destDid = destDid
        this.destVerKey = destVerKey
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

            if (!res.signature) {
                throw new InvalidTransaction('Signature is required')
            }

            // if (!res.role) {
            //     throw new InvalidTransaction('Role is required')
            // }

            return new CredClaimPayload(res.type, res.sourceDid, res.sourceVerKey, 
                res.destDid, res.destVerKey, res.signature)
        } else {
            throw new InvalidTransaction('Invalid payload serialization').catch(err => {console.log(err)})
        }

    }
}

module.exports = CredClaimPayload
