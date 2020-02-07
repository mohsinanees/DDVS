/*                                                                                           *  
    --------------------------------------------------------------------------------------- 
   | * This is the Transaction Structure Definition for DID Transactions both Registration |
   |   and connection.                                                                     | 
   | * DID is the main component of DCACVS as it is the part of every Transaction.         | 
   | * Every participant must own a registered DID on Network to be able to issue, claim   | 
   |   or authorize any credential.                                                        | 
   | * It replicates the Self Sovereign Identity of any individual Globally                | 
    ---------------------------------------------------------------------------------------  
*                                                                                            */ 
'use strict'

const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const cbor = require('cbor')
const { createHash } = require('crypto')

class SchemaPayload {
    constructor(sourceDid, sourceVerKey, version, title, nonce, signature, attributes) {
        this.sourceDid = sourceDid
        this.sourceVerKey = sourceVerKey
        this.schemaID = createHash('sha256').update(JSON.stringify(attributes)).digest('hex')
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

            // if (!res.schemaID) {
            //     throw new InvalidTransaction('schemaID is required')
            // }

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

            return new SchemaPayload(res.sourceDid, res.sourceVerKey, res.version, 
                res.title, res.nonce, res.signature, res.attributes)
        } else {
            throw new InvalidTransaction('Invalid payload serialization').catch(err => {console.log(err)})
        }

    }
}

module.exports = SchemaPayload
