

const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { createHash } = require('crypto')
const { protobuf } = require('sawtooth-sdk')
const cbor = require('cbor')
const request = require('request')
const SQL = require('./sql')
const fs = require('fs')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
const privateKeyHex = fs.readFileSync("/home/mohsin/.sawtooth/keys/mohsin.priv", 'utf8')
var sleep = require('sleep');

class VaultClient {
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
    let count = 0
    records.forEach((record) => {
      const payload = {
        CustID: record.customercode,
        CustName: record.customername,
        TradeChannel: record.tradechannel
      }
      const payloadBytes = cbor.encode(payload)

      const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: 'vault',
        familyVersion: '1.0.0',
        inputs: ['62c100'],
        outputs: ['62c100'],
        signerPublicKey: signerPubKey,
        nonce: count.toString(),
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
      count++
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
      url: 'http://127.0.0.1:8008/batches',
      body: batchListBytes,
      headers: { 'Content-Type': 'application/octet-stream' }
    }, (err, response) => {
      if (err) return console.log(err)
      console.log(response.body)
    })
  }
}

function start(offset) {
  const sql = new SQL()
  const client = new VaultClient(privateKeyHex)
  sql.readRecords(100, offset).then((res) => {
    const records = res
    const transactions = client.CreateTransactions(records)
    const batch = client.CreateBatch(transactions)
    client.SubmitBatch(batch)

  }).catch(err => {
    return err
  })
}
  
start(offset = 0)
  


