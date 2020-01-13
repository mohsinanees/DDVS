

const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { createHash } = require('crypto')
const { protobuf } = require('sawtooth-sdk')
const cbor = require('cbor')
const request = require('request')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const {BATCH_URL} = require('../config')
const {
  DID_FAMILY,
  VERSION,
  DID_NAMESPACE,
  _genDIDAddress
} = require('./namespace')


class DIDTransaction {
  constructor(privateKeyHex) {
    this.context = createContext('secp256k1')
    this.privateKey = Secp256k1PrivateKey.fromHex(privateKeyHex)
    let signer = new CryptoFactory(this.context)
    this.signer = signer.newSigner(this.privateKey)
  }

  CreateTransactions(records) {
    const signer = this.signer
    const signerPubKey = signer.getPublicKey().asHex()

    let transactions = []
    records.forEach((record) => {
      const payload = {
        sourceDid: record.sourceDid,
        sourceVerKey: record.sourceVerKey,
        destDid: record.destDid,
        destVerKey: record.destVerKey,
        nonce: record.nonce,
        signature: record.signature,
        role: record.role
      }

      const payloadBytes = cbor.encode(payload)
      const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: DID_FAMILY,
        familyVersion: VERSION,
        inputs: [DID_NAMESPACE],
        outputs: [DID_NAMESPACE],
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
      if (err) {
        console.log(err)
        throw err
      } 
      console.log(response.body)
      return response.body
    })
  }
}

module.exports = DIDTransaction