

const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { createHash } = require('crypto')
const { protobuf } = require('sawtooth-sdk')
const cbor = require('cbor')
const request = require('request')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const {BATCH_URL} = require('../config')
const {
  Request_family,
  version,
  Request_namespace,
  _genRequestAddress
} = require('./namespace')
const { DID_NAMESPACE, _genDIDAddress } = require("../DID/namespace")

class RequestTransaction {
  constructor(privateKeyHex, requesterPrivatekey) {
    this.context = createContext('secp256k1')
    this.privateKey = Secp256k1PrivateKey.fromHex(privateKeyHex)
    let signer = new CryptoFactory(this.context)
    this.signer = signer.newSigner(this.privateKey)
    this.requesterPrivatekey = Secp256k1PrivateKey.fromHex(requesterPrivatekey)
    let requester = new CryptoFactory(this.context)
    this.requester = requester.newSigner(this.requesterPrivatekey)
  }

  CreateTransactions(records) {
    const signer = this.signer
    const signerPubKey = signer.getPublicKey().asHex()

    let transactions = []
    records.forEach((record) => {
      let sourceDid = _genDIDAddress(record.sourceVerKey)
      let destDid = _genDIDAddress(record.destVerKey)
      const payload = {
        type: record.type,
        requestID: createHash("sha256").update(JSON.stringify(record.type, record.sourceDid, 
          record.destDid)).digest("hex"),
        sourceDid: sourceDid,
        sourceVerKey: record.sourceVerKey,
        destDid: destDid,
        destVerKey: record.destVerKey,
        nonce: record.nonce,
        signature: this.requester.sign(record.nonce)
      }

      let address = _genRequestAddress(payload.requestID)
      const payloadBytes = cbor.encode(payload)

      const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: Request_family,
        familyVersion: version,
        inputs: [Request_namespace],
        outputs: [Request_namespace],
        signerPublicKey: signerPubKey,
        nonce: new Date().getTime().toString(),
        batcherPublicKey: signerPubKey,
        dependencies: [],
        payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
      }).finish()

      const signature = signer.sign(transactionHeaderBytes)
      const transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature: signature,
        payload: payloadBytes
      })
      transactions.push(transaction)
    })

    return transactions

  }

  CreateBatch(transactions) {
    const signer = this.signer
    const batchHeaderBytes = protobuf.BatchHeader.encode({
      signerPublicKey: signer.getPublicKey().asHex(),
      transactionIds: transactions.map((txn) => txn.headerSignature),
    }).finish()

    const signature = signer.sign(batchHeaderBytes)

    const batch = protobuf.Batch.create({
      header: batchHeaderBytes,
      headerSignature: signature,
      transactions: transactions
    })

    const batchListBytes = protobuf.BatchList.encode({
      batches: [batch]
    }).finish()

    return batchListBytes
  }

  SubmitBatch(batchListBytes) {
    request.post({
      url: BATCH_URL,
      body: batchListBytes,
      headers: { 'Content-Type': 'application/octet-stream' }
    }, (err, response) => {
      if (err) return console.log(err)
      console.log(response.body)
    })
  }
}

module.exports = RequestTransaction