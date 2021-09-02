// const { Secp256k1Context, Secp256k1PublicKey, Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')
// const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
// const fs = require('fs')
// const msg = "123456789"
// const pubkey = "02a8e1062dd00b03fde4ac8ab2c60c9c29a93ce2f4de23d273d702be830737f4f4"
// const sig = "0e3e487e92a1a45ed8e617318853e60d29418f78a975e7e87fb4a6300366cea41d698407f60a12ccdef61b75aaf03cb92989087d92986fd8dab2f0f9e95fae5c"
// const issuerPrivateKey = fs.readFileSync(`/home/mohsin/Documents/issuer.priv`, 'utf8')
// const issuerVerKey = fs.readFileSync(`/home/mohsin/Documents/issuer.pub`, 'utf8')
// let context = createContext('secp256k1')
// let issuerPrivateKeyObj = Secp256k1PrivateKey.fromHex(issuerPrivateKey)
// let issuer = new CryptoFactory(context).newSigner(issuerPrivateKeyObj)
// let issuerSignature = issuer.sign(Buffer.from(msg))
// console.log(issuerSignature)
// let PubKey = new Secp256k1PublicKey(Buffer.from(pubkey, 'hex'))
// console.log(PubKey)
// let signer = new Secp256k1Context()
// console.log(signer)
// // let status = signer.verify(sig, msg, PubKey)
// console.log(status)
const express = require("express");
const cors = require("cors");
const BodyParser = require("body-parser");
const app = express();
const PORT = 5000;
app.options("*", cors());
app.use(cors());
app.use(BodyParser.json({ limit: `50mb` }));
const axios = require("axios");

app.post("/proxy/connection", async (req, res) => {
    let data = req.body;
    // console.log(data)
    let result = await axios.post(
        "http://192.168.1.145:7000/request/connection/",
        {
            header: { "Content-Type": "application/json" },
            body: data,
        }
    );
    console.log(result.data);
    if (result.data.status) {
        res.status(200).send(result.data);
    } else {
        res.status(402).send("connection failed");
    }
});

app.get("/proxy/credential", async (req, res) => {
    let params = req.query;
    // console.log(data)
    let result = await axios.get(
        "http://192.168.1.145:7000/request/credential/",
        {
            header: { "Content-Type": "application/json" },
            params: params,
        }
    );
    console.log(result.data);
    if (result.data) {
        res.status(200).send(result.data);
    } else {
        res.status(402).send("credential does not exist");
    }
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
