/*                                                                                           *  
    --------------------------------------------------------------------------------------- 
   | * This is the Transaction Structure Definition for Credential Transactions.           |
   |   and connection.                                                                     | 
   | * Here we define the methods to Define the credential for any individual who is part  |
   |   of the network.                                                                     | 
   | * Every participant must own a registered DID on Network to be able to issue, claim   | 
   |   or authorize any credential.                                                        | 
    ---------------------------------------------------------------------------------------  
*                                                                                            */
"use strict";

const { InvalidTransaction } = require("sawtooth-sdk/processor/exceptions");
const cbor = require("cbor");
const { createHash } = require("crypto");

class CredentialPayload {
    constructor(
        authorizerDid,
        authorizerVerKey,
        sourceDid,
        sourceVerKey,
        destDid,
        destVerKey,
        schemaID,
        schemaVersion,
        credentialTitle,
        nonce,
        issuerSignature,
        authorizerSignature,
        credentialBody
    ) {
        this.authorizerDid = authorizerDid;
        this.authorizerVerKey = authorizerVerKey;
        this.sourceDid = sourceDid;
        this.sourceVerKey = sourceVerKey;
        this.destDid = destDid;
        this.destVerKey = destVerKey;
        this.schemaID = schemaID;
        this.schemaVersion = schemaVersion;
        this.credentialID = createHash("sha256")
            .update(
                JSON.stringify([
                    credentialBody.student_name,
                    credentialBody.student_cnic,
                    credentialBody.level,
                ])
            )
            .digest("hex");
        this.credentialTitle = credentialTitle;
        this.nonce = nonce;
        this.issuerSignature = issuerSignature;
        this.authorizerSignature = authorizerSignature;
        this.credentialBody = credentialBody;
    }

    static async fromBytes(payload) {
        let res = await cbor.decode(payload);
        if (res) {
            if (!res.authorizerDid) {
                throw new InvalidTransaction("authorizerDid is required");
            }

            if (!res.authorizerVerKey) {
                throw new InvalidTransaction("authorizerVerKey is required");
            }

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

            if (!res.schemaID) {
                throw new InvalidTransaction("Schema ID is required");
            }

            if (!res.schemaVersion) {
                throw new InvalidTransaction("Schema version is required");
            }

            // if (!res.credentialID) {
            //     throw new InvalidTransaction('credentialID is required')
            // }

            if (!res.credentialTitle) {
                throw new InvalidTransaction("credentialTitle is required");
            }

            if (!res.nonce) {
                throw new InvalidTransaction("nonce is required");
            }

            if (!res.issuerSignature) {
                throw new InvalidTransaction("Issuer Signature is required");
            }

            if (!res.authorizerSignature) {
                throw new InvalidTransaction(
                    "Authorizer Signature is required"
                );
            }

            if (!res.credentialBody) {
                throw new InvalidTransaction("Credential is required");
            }

            return new CredentialPayload(
                res.authorizerDid,
                res.authorizerVerKey,
                res.sourceDid,
                res.sourceVerKey,
                res.destDid,
                res.destVerKey,
                res.schemaID,
                res.schemaVersion,
                res.credentialTitle,
                res.nonce,
                res.issuerSignature,
                res.authorizerSignature,
                res.credentialBody
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

module.exports = CredentialPayload;
