
const DIDClient = require('./DIDTransaction')
const fs = require('fs')
const USER = require("os").userInfo().username
const privateKeyHex = fs.readFileSync(`/home/${USER}/.sawtooth/keys/${USER}.priv`, 'utf8')

// let record = {
//   sourceVerKey: issuerPubKey,
//   destVerKey: "issuer test",
//   nonce: "123456789",
//   role: "standard"
// }

function submitDid( sourceDid, sourceVerKey, destDid, destVerKey, nonce, signature, role ) {
  let record = {
    sourceDid: sourceDid,
    sourceVerKey: sourceVerKey,
    destDid: destDid,
    destVerKey: destVerKey,
    nonce: nonce,
    signature: signature,
    role: role
  }
  const client = new DIDClient(privateKeyHex)
  const records = [record]
  const transactions = client.CreateTransactions(records)
  const batch = client.CreateBatch(transactions)
  try {
    let status  = client.SubmitBatch(batch)
    // console.log(decodeUriComponent(status))
    return true
  } catch (err) {
    console.log(err)
    return false
  }

}

module.exports = submitDid
