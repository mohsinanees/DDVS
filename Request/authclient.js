
const RequestTransaction = require('./RequestTransaction')
const fs = require('fs')
const USER = require("os").userInfo().username
const authorPrivateKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.priv`, 'utf8')
const authorPubKey = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.pub`, 'utf8')
const issuerPrivateKey = fs.readFileSync(`/home/mohsin/Documents/issuer.priv`, 'utf8')
const issuerPubKey = fs.readFileSync(`/home/mohsin/Documents/issuer.pub`, 'utf8')
const studentPrivateKey = fs.readFileSync(`/home/mohsin/Documents/student.priv`, 'utf8')
const studentPubKey = fs.readFileSync(`/home/mohsin/Documents/student.pub`, 'utf8')
const decodeUriComponent = require('decode-uri-component');

let record = {
  type: "connection",
  sourceVerKey: studentPubKey,
  destVerKey: authorPubKey,
  nonce: "123456789",
}

function submitAuthRequest(type, sourceDid, sourceVerKey, destDid, destVerKey, schemaID,
  credentialTitle, credentialBody) {
  let record = {
    type: type,
    sourceDid: sourceDid,
    sourceVerKey: sourceVerKey,
    destDid: destDid,
    destVerKey: destVerKey,
    schemaID: schemaID,
    credentialTitle: credentialTitle,
    nonce: nonce,
    signature: signature,
  }
  const client = new RequestTransaction(authorPrivateKey, studentPrivateKey)
  const records = [record]
  const transactions = client.CreateTransactions(records)
  const batch = client.CreateBatch(transactions)
  try{
    let status = client.SubmitBatch(batch)
    // console.log(decodeUriComponent(status))
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

module.exports = submitAuthRequest
