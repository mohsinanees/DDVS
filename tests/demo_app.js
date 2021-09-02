const { createContext, CryptoFactory } = require("sawtooth-sdk/signing");
const { createHash } = require("crypto");
const { protobuf } = require("sawtooth-sdk");
const cbor = require("cbor");
const request = require("request");
const fs = require("fs");
const { Secp256k1PrivateKey } = require("sawtooth-sdk/signing/secp256k1");
const USER = require("os").userInfo().username;
const privateKeyHex = fs.readFileSync(
    `/home/${USER}/.sawtooth/keys/${USER}.priv`,
    "utf8"
);
//const schedule = require('node-schedule')

const DDVS_FAMILY = "DDVS";

const _hash = (x) =>
    createHash("sha512").update(x).digest("hex").toLowerCase().substring(0, 64);

const DDVS_NAMESPACE = _hash(DDVS_FAMILY).substring(20, 26);

const _genDDVSAddress = (x) => DDVS_NAMESPACE + _hash(x);

class DDVSClient {
    constructor(privateKeyHex) {
        this.context = createContext("secp256k1");
        this.privateKey = Secp256k1PrivateKey.fromHex(privateKeyHex);
        let signer = new CryptoFactory(this.context);
        this.signer = signer.newSigner(this.privateKey);
    }

    CreateTransactions(records, dbHandler) {
        const signer = this.signer;
        const signerPubKey = signer.getPublicKey().asHex();

        let address;
        let transactions = [];
        records.forEach((record) => {
            const payload = {
                Institute: record.Institute,
                CertType: record.CertType,
                ID: record.ID,
                Name: record.Name,
                FatherName: record.FatherName,
                session: record.session,
                program: record.program,
                passingDate: record.passingDate,
            };

            //let res = dbHandler.readAddress(payload.CustID.toString());
            //console.log("getting res data here ")
            // if (res.length > 0) {
            //   address = res
            // } else {
            address = _genDDVSAddress(payload.ID);
            //dbHandler.insertAddress(payload.CustID.toString(), address.toString())
            // }
            const payloadBytes = cbor.encode(payload);
            //console.log("creating")
            const transactionHeaderBytes = protobuf.TransactionHeader.encode({
                familyName: "DDVS",
                familyVersion: "1.0.0",
                inputs: [address.toString()],
                outputs: [address.toString()],
                signerPublicKey: signerPubKey,
                nonce: new Date().toISOString(), //record.due_perd.toString(),
                batcherPublicKey: signerPubKey,
                dependencies: [],
                payloadSha512: createHash("sha512")
                    .update(payloadBytes)
                    .digest("hex"),
            }).finish();
            //console.log("finish")

            const signature = signer.sign(transactionHeaderBytes);

            const transaction = protobuf.Transaction.create({
                header: transactionHeaderBytes,
                headerSignature: signature,
                payload: payloadBytes,
            });
            //console.log("done")
            transactions.push(transaction);
        });

        //console.log("out of second then")
        return transactions;
    }

    CreateBatch(transactions) {
        const signer = this.signer;
        const batchHeaderBytes = protobuf.BatchHeader.encode({
            signerPublicKey: signer.getPublicKey().asHex(),
            transactionIds: transactions.map((txn) => txn.headerSignature),
        }).finish();

        const signature = signer.sign(batchHeaderBytes);

        const batch = protobuf.Batch.create({
            header: batchHeaderBytes,
            headerSignature: signature,
            transactions: transactions,
        });

        const batchListBytes = protobuf.BatchList.encode({
            batches: [batch],
        }).finish();

        return batchListBytes;
    }

    SubmitBatch(batchListBytes) {
        request.post(
            {
                url: "http://127.0.0.1:8008/batches",
                body: batchListBytes,
                headers: { "Content-Type": "application/octet-stream" },
            },
            (err, response) => {
                if (err) return console.log(err);
                console.log(response.body);
            }
        );
    }
}

let Certificate = {
    Institute: "Govt. Islamia College Civil Lines Lahore",
    CertType: "Character Certificate",
    ID: "116153",
    Name: "Ghulam Kibria Butt",
    FatherName: "Abdul Ghafoor Butt",
    session: "2013-2015",
    program: "FSC Pre Eng",
    passingDate: "17-09-2015",
};

function start() {
    const client = new DDVSClient(privateKeyHex);
    const records = [Certificate];
    const transactions = client.CreateTransactions(records, sql);
    const batch = client.CreateBatch(transactions);
    client.SubmitBatch(batch);

    // }).catch(err => {
    //   return err
    // })
}

start();
//schedule.scheduleJob('3 * * * *', start(offset = 0));
