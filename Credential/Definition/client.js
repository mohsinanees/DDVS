
const CredentialTransaction = require('./CredentialTransaction')
const fs = require('fs')
const USER = require("os").userInfo().username
const authorPrivateKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.priv`, 'utf8')
const authorPubKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.pub`, 'utf8')
const issuerPrivateKey = fs.readFileSync(`/home/mohsin/Documents/issuer.priv`, 'utf8')
const issuerPubKey = fs.readFileSync(`/home/mohsin/Documents/issuer.pub`, 'utf8')
const studentPubKey = fs.readFileSync(`/home/mohsin/Documents/student.pub`, 'utf8')

let record = {
  authorizerVerKey: authorPubKey,
  sourceVerKey: issuerPubKey,
  destVerKey: studentPubKey,
  schemaID: "de3b164a96c33082bbd54bb5256d41c76e9628877faf102c10783888803fa3cf",
  schemaVersion: "0.7",
  credentialTitle: "Transcript",
  credentialBody: {
    institute_name: "COMSATS",
    student_name: "Mohsin Anees",
    registration_number: "SP16-BCS-184",
    student_cnic: "35202-3642273-3",
    level: "Under-Grad",
    total_marks: '1050',
    obtained_marks: "994",
    subjects: "Computer Science",
    passing_year: "2020"
  }
}

function start() {
  const transaction = new CredentialTransaction(authorPrivateKey, issuerPrivateKey)
  const records = [record]
  const transactions = transaction.CreateTransactions(records)
  const batch = transaction.CreateBatch(transactions)
  transaction.SubmitBatch(batch)
}

start()
