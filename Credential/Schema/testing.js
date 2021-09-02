const {
    Secp256k1Context,
    Secp256k1PublicKey,
} = require("sawtooth-sdk/signing/secp256k1");
const msg = "123456789";
const pubkey =
    "03cbdc0d235fbdce9e4186069d0b3bf3bb43641a1e6bb1659b0a023d2babdde4dc";
const sig =
    "0e3e487e92a1a45ed8e617318853e60d29418f78a975e7e87fb4a6300366cea41d698407f60a12ccdef61b75aaf03cb92989087d92986fd8dab2f0f9e95fae5c";

let PubKey = new Secp256k1PublicKey(Buffer.from(pubkey, "hex"));
console.log(PubKey);
let signer = new Secp256k1Context();
let status = signer.verify(sig, msg, PubKey);
console.log(status);
