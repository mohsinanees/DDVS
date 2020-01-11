

const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { createHash } = require('crypto')
const { protobuf } = require('sawtooth-sdk')
const cbor = require('cbor')
const request = require('request')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const { BATCH_URL } = require('../../config')
const {
  credDef_family,
  version,
  credDef_namespace,
  _genCredentialAddress
} = require('./namespace')
const { DID_NAMESPACE, _genDIDAddress } = require("../../DID/namespace")
const { schema_namespace } = require("../Schema/namespace")

class CredentialTransaction {
  constructor(privateKeyHex, issuerPrivateKey) {
    this.context = createContext('secp256k1')
    this.privateKey = Secp256k1PrivateKey.fromHex(privateKeyHex)
    let signer = new CryptoFactory(this.context)
    this.signer = signer.newSigner(this.privateKey)
    this.issuerPrivateKey = Secp256k1PrivateKey.fromHex(issuerPrivateKey)
    let issuer = new CryptoFactory(this.context)
    this.issuer = issuer.newSigner(this.issuerPrivateKey)
  }

  CreateTransactions(records) {
    const signer = this.signer
    const signerPubKey = signer.getPublicKey().asHex()

    let transactions = []
    records.forEach((record) => {
      let authorizerDid = _genDIDAddress(record.authorizerVerKey)
      let sourceDid = _genDIDAddress(record.sourceVerKey)
      let destDid = _genDIDAddress(record.destVerKey)
      let nonce = createHash('sha256').update(JSON.stringify(record.credentialBody)).digest('hex')
      const payload = {
        authorizerDid: authorizerDid,
        authorizerVerKey: record.authorizerVerKey,
        sourceDid: sourceDid,
        sourceVerKey: record.sourceVerKey,
        destDid: destDid,
        destVerKey: record.destVerKey,
        schemaID: record.schemaID,
        schemaVersion: record.schemaVersion,
        credentialID: createHash('sha256').update(JSON.stringify(record.credentialBody.student_name,
          record.credentialBody.student_cnic, record.credentialBody.level)).digest("hex"),
        credentialTitle: record.credentialTitle,
        nonce: nonce,
        issuerSignature: this.issuer.sign(Buffer.from(nonce)),
        authorizerSignature: signer.sign(Buffer.from(nonce)),
        credentialBody: record.credentialBody
      }
      
      let address = _genCredentialAddress(payload.credentialID)
      const payloadBytes = cbor.encode(payload)

      const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: credDef_family,
        familyVersion: version,
        inputs: [credDef_namespace, schema_namespace, DID_NAMESPACE],
        outputs: [credDef_namespace],
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

module.exports = CredentialTransaction