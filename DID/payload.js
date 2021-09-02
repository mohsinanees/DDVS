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
"use strict";

const { InvalidTransaction } = require("sawtooth-sdk/processor/exceptions");
const cbor = require("cbor");

class DIDPayload {
    constructor(
        sourceDid,
        sourceVerKey,
        destDid,
        destVerKey,
        nonce,
        signature,
        role
    ) {
        this.sourceDid = sourceDid;
        this.sourceVerKey = sourceVerKey;
        this.destDid = destDid;
        this.destVerKey = destVerKey;
        this.nonce = nonce;
        this.signature = signature;
        this.role = role;
    }

    static async fromBytes(payload) {
        let res = await cbor.decode(payload);
        if (res) {
            if (!res.sourceDid) {
                throw new InvalidTransaction("SourceDid is required");
            }

            if (!res.sourceVerKey) {
                throw new InvalidTransaction("SourceVerKey is required");
            }

            if (!res.destDid) {
                throw new InvalidTransaction("DestDid is required");
            }

            if (!res.destVerKey) {
                throw new InvalidTransaction("DestVerKey is required");
            }

            if (!res.nonce) {
                throw new InvalidTransaction("nonce is required");
            }

            if (!res.signature) {
                throw new InvalidTransaction("Signature is required");
            }

            if (!res.role) {
                throw new InvalidTransaction("Role is required");
            }

            return new DIDPayload(
                res.sourceDid,
                res.sourceVerKey,
                res.destDid,
                res.destVerKey,
                res.nonce,
                res.signature,
                res.role
            );
        } else {
            throw new InvalidTransaction("Invalid payload serialization").catch(
                (err) => {
                    console.log(err);
                }
            );
        }
    }
}

module.exports = DIDPayload;
