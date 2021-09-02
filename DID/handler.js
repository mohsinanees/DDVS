/*                                                                                 *  
    ----------------------------------------------------------------------------- 
   | * This is the Transaction Verification Module for all the DID Transactions. |
   | * All the checks are implemented in 'apply' method of Handler class.        |
   | * Here we use Global Verification Methods defined in "verify.js" to verify  |
   |   the Isuuer and Requester of DID.                                          |  
    ----------------------------------------------------------------------------- 
*                                                                                  */
"use strict";
var colors = require("colors");
const DIDPayload = require("./payload");
const { TransactionHandler } = require("sawtooth-sdk/processor/handler");
const { InvalidTransaction } = require("sawtooth-sdk/processor/exceptions");
const {
    DID_FAMILY,
    VERSION,
    DID_NAMESPACE,
    _genDIDAddress,
} = require("./namespace");
const { issuerVerify, requesterExist, setEntry } = require("../verify");
const { roles } = require("../config");
var count = 0;

class DIDHandler extends TransactionHandler {
    constructor() {
        console.info(
            (
                "[" +
                new Date().toISOString().replace(/T/, " ").replace(/\..+/, "") +
                " INFO\tDID_processor]"
            ).green
        );
        super(DID_FAMILY, [VERSION], [DID_NAMESPACE]);
    }

    async apply(transactionProcessRequest, context) {
        let payload = await DIDPayload.fromBytes(
            transactionProcessRequest.payload
        );
        // console.log("\n\n"+payload);
        let header = transactionProcessRequest.header;
        let approverAddress = _genDIDAddress(payload.sourceVerKey);
        let requesterAddress = _genDIDAddress(payload.destVerKey);
        let actionPromise;

        let res = await context.getState([approverAddress, requesterAddress]);
        let requesterStatus = requesterExist(res, requesterAddress);
        if (requesterStatus) {
            throw new InvalidTransaction("requester already exist");
        }
        if (payload.role != roles.authorizer && payload.role != roles.issuer) {
            let issuerStatus = issuerVerify(
                res,
                approverAddress,
                payload.sourceDid,
                payload.sourceVerKey,
                payload.signature,
                payload.nonce
            );
            if (!issuerStatus) {
                throw new InvalidTransaction("invalid Issuer");
            }
        }
        actionPromise = setEntry(context, requesterAddress, payload);
        if (actionPromise) {
            if (count == 0) {
                logger(payload);
                count++;
            } else {
                count = 0;
            }
        }
    }
}

const logger = (message) => {
    console.log(
        (
            "[" +
            new Date().toISOString().replace(/T/, " ").replace(/\..+/, "") +
            " " +
            "DEBUG" +
            "\tDID_processor" +
            "]"
        ).green +
        "\n" +
        `SourceDid: ${message.sourceDid}\n` +
        `SourceVerKey: ${message.sourceVerKey}\n` +
        `DestDid: ${message.destDid}\n` +
        `DestVerKey: ${message.destVerKey}\n` +
        `nonce: ${message.nonce}\n` +
        `Signature: ${message.signature} \n` +
        `Role: ${message.role}`
    );
};

module.exports = DIDHandler;
