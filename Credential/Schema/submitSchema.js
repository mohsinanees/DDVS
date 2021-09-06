const SchemaTransaction = require("./SchemaTransaction");

// let record = {
//   sourceVerKey: authorPubKey,
//   version: "0.7",
//   title: "Transcript",
//   nonce: "123456789",
//   attributes: {
//     institute: "institute_Name",
//     name: "student_name",
//     cnic: "cnic",
//     regid: "registration_number",
//     level: "level",
//     totalmarks: "total_marks",
//     obtainedmarks: "obtained_marks",
//     subjects: "subjects",
//     subjectmarks: "subject_marks",
//     passingyear: "passing_year"
//   }
// }

function submitSchema(
    authorizerPrivateKeyHex,
    sourceDid,
    sourceVerKey,
    version,
    title,
    nonce,
    signature,
    attributes
) {
    let record = {
        sourceDid: sourceDid,
        sourceVerKey: sourceVerKey,
        version: version,
        title: title,
        nonce: nonce,
        signature: signature,
        attributes: attributes,
    };
    const client = new SchemaTransaction(authorizerPrivateKeyHex);
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

module.exports = submitSchema;
