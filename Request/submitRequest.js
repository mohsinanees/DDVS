/*                                                                                    *  
    -------------------------------------------------------------------------------- 
   | * This is the client application for all the Request Types which initiates the |
   |   processing.                                                                  |           |  
    --------------------------------------------------------------------------------
*                                                                                     */
const RequestTransaction = require("./RequestTransaction");
const decodeUriComponent = require("decode-uri-component");

// let record = {
//   type: "connection",
//   sourceVerKey: studentPubKey,
//   destVerKey: authorPubKey,
//   nonce: "123456789",
// }

function submitRequest(
    approverPrivateKey,
    requesterPrivateKey,
    type,
    sourceDid,
    sourceVerKey,
    destDid,
    destVerKey,
    nonce,
    signature
) {
    let record = {
        type: type,
        sourceDid: sourceDid,
        sourceVerKey: sourceVerKey,
        destDid: destDid,
        destVerKey: destVerKey,
        nonce: nonce,
        signature: signature,
    };
    // console.log(record);
    const client = new RequestTransaction(
        approverPrivateKey,
        requesterPrivateKey
    );
    const records = [record];
    const transactions = client.CreateTransactions(records);
    const batch = client.CreateBatch(transactions);
    try {
        let status = client.SubmitBatch(batch);
        // console.log(decodeUriComponent(status))
        return true;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

function submitAuthorizationRequest(
    authorizerPrivateKeyHex,
    requesterPrivateKeyHex,
    type,
    sourceDid,
    sourceVerKey,
    destDid,
    destVerKey,
    schemaID,
    credentialTitle,
    credentialBody,
    nonce,
    signature
) {
    let record = {
        type: type,
        sourceDid: sourceDid,
        sourceVerKey: sourceVerKey,
        destDid: destDid,
        destVerKey: destVerKey,
        schemaID: schemaID,
        credentialTitle: credentialTitle,
        credentialBody: credentialBody,
        nonce: nonce,
        signature: signature,
    };
    // console.log(record);
    const client = new RequestTransaction(
        authorizerPrivateKeyHex,
        requesterPrivateKeyHex
    );
    const records = [record];
    const transactions = client.CreateTransactions(records);
    const batch = client.CreateBatch(transactions);
    try {
        let status = client.SubmitBatch(batch);
        // console.log(decodeUriComponent(status))
        return true;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
module.exports = { submitRequest, submitAuthorizationRequest };
