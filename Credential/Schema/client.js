
const SchemaClient = require('./SchemaTransaction')
const fs = require('fs')
const USER = require("os").userInfo().username
const authorPrivateKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.priv`, 'utf8')
const authorPubKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.pub`, 'utf8')

let record = {
  sourceVerKey: authorPubKey,
  version: "0.7",
  title: "Report Card",
  nonce: "123456789",
  attributes: {
    institute: "Institute Name",
    name: "Student Name",
    cnic: "Cnic",
    regid: "Registration Number",
    level: "Level",
    totalmarks: "Total Marks",
    obtainedmarks: "Obtained Marks",
    subjects: "Subjects",
    subjectmarks: "Subject Marks",
    passingyear: "Passing Year"
  }
}

function start(offset) {
  const client = new SchemaClient(authorPrivateKey)
  const records = [record]
  const transactions = client.CreateTransactions(records)
  const batch = client.CreateBatch(transactions)
  client.SubmitBatch(batch)
}

start(offset = 0)
