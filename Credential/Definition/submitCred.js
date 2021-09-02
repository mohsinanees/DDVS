const CredentialTransaction = require("./CredentialTransaction");

// let record = {
//   authorizerVerKey: authorPubKey,
//   sourceVerKey: issuerPubKey,
//   destVerKey: studentPubKey,
//   schemaID: "de3b164a96c33082bbd54bb5256d41c76e9628877faf102c10783888803fa3cf",
//   schemaVersion: "0.7",
//   credentialTitle: "Transcript",
//   credentialBody: {
//     institute_name: "COMSATS",
//     student_name: "Mohsin Anees",
//     registration_number: "SP16-BCS-184",
//     student_cnic: "35202-3642273-3",
//     level: "Under-Grad",
//     total_marks: '1050',
//     obtained_marks: "994",
//     subjects: "Computer Science",
//     passing_year: "2020"
//   }
// }

function submitCredential(
    authorizerPrivateKeyHex,
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
    let record = {
        authorizerDid: authorizerDid,
        authorizerVerKey: authorizerVerKey,
        sourceDid: sourceDid,
        sourceVerKey: sourceVerKey,
        destDid: destDid,
        destVerKey: destVerKey,
        schemaID: schemaID,
        schemaVersion: schemaVersion,
        credentialTitle: credentialTitle,
        nonce: nonce,
        issuerSignature: issuerSignature,
        authorizerSignature: authorizerSignature,
        credentialBody: credentialBody,
    };
    const client = new CredentialTransaction(authorizerPrivateKeyHex);
    const records = [record];
    const transactions = client.CreateTransactions(records);
    const batch = client.CreateBatch(transactions);
    try {
        let status = client.SubmitBatch(batch);
        // console.log(decodeUriComponent(status))
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = submitCredential;
