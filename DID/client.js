
const DIDClient = require('./DIDTransaction')
const fs = require('fs')
const USER = require("os").userInfo().username
const authorPrivateKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.priv`, 'utf8')
const authorPubKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.pub`, 'utf8')
const issuerPrivateKey = fs.readFileSync(`/home/mohsin/Documents/issuer.priv`, 'utf8')
const issuerPubKey = fs.readFileSync(`/home/mohsin/Documents/issuer.pub`, 'utf8')
const studentPubKey = fs.readFileSync(`/home/mohsin/Documents/student.pub`, 'utf8')

let record = {
  sourceVerKey: issuerPubKey,
  destVerKey: studentPubKey,
  nonce: "123456789",
  role: "standard"
}

function start(offset) {
  const client = new DIDClient(authorPrivateKey, issuerPrivateKey)
  const records = [record]
  const transactions = client.CreateTransactions(records)
  const batch = client.CreateBatch(transactions)
  client.SubmitBatch(batch)
}

start(offset = 0)
