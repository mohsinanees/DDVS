const cbor = require('cbor')
var colors = require('colors')
const { Secp256k1Context, Secp256k1PublicKey } = require('sawtooth-sdk/signing/secp256k1')
const {
    authorizer,
    issuer,
    standard
} = require("./config").roles

const setEntry = (context, address, stateValue) => {
    let entries = {
        [address]: cbor.encode(stateValue)
    }
    return context.setState(entries)
}

const authorizerVerify = (possibleAddressValues, address, payload) => {
    let stateValueRep = possibleAddressValues[address]
    let stateValue
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep)
        if (payload.authorizerDid == stateValue.destDid) {
            if (payload.authorizerVerKey == stateValue.destVerKey) {
                if (stateValue.role == authorizer) {
                    let PubKey = Secp256k1PublicKey.fromHex(payload.authorizerVerKey)
                    let signer = new Secp256k1Context()
                    let status = signer.verify(payload.authorizerSignature, payload.nonce, PubKey)
                    return status
                }
            }
        }
    }
    return false
}

const issuerVerify = (possibleAddressValues, address, payload) => {
    let stateValueRep = possibleAddressValues[address]
    let stateValue
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep)
        if (payload.sourceDid == stateValue.destDid) {
            if (payload.sourceVerKey == stateValue.destVerKey) {
                if (stateValue.role == issuer || stateValue.role == authorizer) {
                    let PubKey = Secp256k1PublicKey.fromHex(payload.sourceVerKey)
                    let signer = new Secp256k1Context()
                    let status = signer.verify(payload.issuerSignature, payload.nonce, PubKey)
                    return status
                }
            }
        }
    }
    return false
}

const requesterVerify = (possibleAddressValues, address, payload) => {
    let stateValueRep = possibleAddressValues[address]
    let stateValue
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep)
        if (payload.sourceDid == stateValue.destDid) {
            if (payload.sourceVerKey == stateValue.sourceVerKey) {
                let PubKey = Secp256k1PublicKey.fromHex(stateValue.sourceVerKey)
                let signer = new Secp256k1Context()
                let status = signer.verify(payload.authorizerSignature, payload.nonce, PubKey)
                return status
            }
        }
    }
    return false
}

const schemaVerify = (possibleAddressValues, address, payload) => {
    let stateValueRep = possibleAddressValues[address]
    let stateValue
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep)
        if (payload.authorizerDid == stateValue.sourceDid) {
            if (payload.authorizerVerKey == stateValue.sourceVerKey) {
                let PubKey = Secp256k1PublicKey.fromHex(stateValue.sourceVerKey)
                let signer = new Secp256k1Context()
                let status = signer.verify(payload.authorizerSignature, payload.nonce, PubKey)
                return status
            }
        }
    }
    return false
}

const requesterExist = (possibleAddressValues, address) => {
    let stateValueRep = possibleAddressValues[address]
    if (stateValueRep && stateValueRep.length > 0) {
        return true
    }
    return false
}

module.exports = {
    authorizerVerify,
    issuerVerify,
    requesterVerify,
    schemaVerify,
    requesterExist,
    setEntry
}