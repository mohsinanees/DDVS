
'use strict'

const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const cbor = require('cbor')

class SchemaPayload {
    constructor(sourceDid, sourceVerKey, schemaID, version, title, nonce, signature, attributes) {
        this.sourceDid = sourceDid
        this.sourceVerKey = sourceVerKey
        this.schemaID = schemaID
        this.version = version
        this.title = title
        this.nonce = nonce
        this.signature = signature
        this.attributes = attributes
    }

    static async fromBytes(payload) {

        let res = await cbor.decode(payload)
        if (res) {

            if (!res.sourceDid) {
                throw new InvalidTransaction('SourceDid is required')
            }

            if (!res.sourceVerKey) {
                throw new InvalidTransaction('SourceVerKey is required')
            }

            if (!res.schemaID) {
                throw new InvalidTransaction('schemaID is required')
            }

            if (!res.version) {
                throw new InvalidTransaction('version is required')
            }

            if (!res.title) {
                throw new InvalidTransaction('schemaTitle is required')
            }

            if (!res.nonce) {
                throw new InvalidTransaction('nonce is required')
            }

            if (!res.signature) {
                throw new InvalidTransaction('signature is required')
            }

            if (!res.attributes) {
                throw new InvalidTransaction('attributes is required')
            }

            return new SchemaPayload(res.sourceDid, res.sourceVerKey, res.schemaID, res.version, 
                res.title, res.nonce, res.signature, res.attributes)
        } else {
            throw new InvalidTransaction('Invalid payload serialization').catch(err => {console.log(err)})
        }

    }
}

module.exports = SchemaPayload
