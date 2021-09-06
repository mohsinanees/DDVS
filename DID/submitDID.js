const DIDTransaction = require("./DIDTransaction");

// let record = {
//   sourceVerKey: issuerPubKey,
//   destVerKey: "issuer test",
//   nonce: "123456789",
//   role: "standard"
// }

function submitDid(
    DidSubmitterPrivateKey,
    sourceDid,
    sourceVerKey,
    destDid,
    destVerKey,
    nonce,
    signature,
    role
) {
    let record = {
        sourceDid: sourceDid,
        sourceVerKey: sourceVerKey,
        destDid: destDid,
        destVerKey: destVerKey,
        nonce: nonce,
        signature: signature,
        role: role,
    };
    const client = new DIDTransaction(DidSubmitterPrivateKey);
    const records = [record];
    const transactions = client.CreateTransactions(records);
    const batch = client.CreateBatch(transactions);
    try {
        client.SubmitBatch(batch);
        return true;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports = submitDid;
