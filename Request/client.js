
const RequestTransaction = require('./RequestTransaction')
const fs = require('fs')
const USER = require("os").userInfo().username
const authorPrivateKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.priv`, 'utf8')
const authorPubKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.pub`, 'utf8')
const issuerPrivateKey = fs.readFileSync(`/home/mohsin/Documents/issuer.priv`, 'utf8')
const issuerPubKey = fs.readFileSync(`/home/mohsin/Documents/issuer.pub`, 'utf8')
const studentPrivateKey = fs.readFileSync(`/home/mohsin/Documents/student.priv`, 'utf8')
const studentPubKey = fs.readFileSync(`/home/mohsin/Documents/student.pub`, 'utf8')

let record = {
  type: "Connection",
  sourceVerKey: studentPubKey,
  destVerKey: issuerPubKey,
  nonce: "123456789",
}

function start(offset) {
  const client = new RequestTransaction(authorPrivateKey, studentPrivateKey)
  const records = [record]
  const transactions = client.CreateTransactions(records)
  const batch = client.CreateBatch(transactions)
  client.SubmitBatch(batch)
}

start(offset = 0)
