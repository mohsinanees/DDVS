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

const axios = require("axios");
let res = axios.post("http://192.168.1.145:7000/request/connection/", {
    header: { "Content-Type": "application/json" },
    body: {
        type: "connection",
        sourceDid:
            "9f39aed951f0f754448844e5b8910b6121df63cf4d560239041b881c177219a6ba39d3",
        sourceVerKey: "5234532452354",
        destDid:
            "9f39ae9c138db820b625d80316c19cd9a0c9c1bbfe256958844ac3dcc4106997b1d275",
        destVerKey:
            "02a8e1062dd00b03fde4ac8ab2c60c9c29a93ce2f4de23d273d702be830737f4f4",
        signature: "653982764593284652938",
        nonce: "53926487",
    },
});
console.log(res);
