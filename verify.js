/*                                                                                *  
    ----------------------------------------------------------------------------
   | * This is the Global Api for Verification methods used in all Transactions.|
   | * Here We define Global Functions to verify all the entities in DACVS i.e. | 
   |   "Issuer", "Authorizer", "Claimer".                                       |  
    ----------------------------------------------------------------------------
*                                                                                 */
const cbor = require("cbor");
var colors = require("colors");
const {
    Secp256k1Context,
    Secp256k1PublicKey,
} = require("sawtooth-sdk/signing/secp256k1");
const { authorizer, issuer, standard } = require("./config").roles;

const setEntry = (context, address, stateValue) => {
    let entries = {
        [address]: cbor.encode(stateValue),
    };
    return context.setState(entries);
};

const authorizerVerify = (
    possibleAddressValues,
    address,
    authorizerDid,
    authorizerVerKey,
    authorizerSignature,
    nonce
) => {
    let stateValueRep = possibleAddressValues[address];
    let stateValue;
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep);
        if (authorizerDid == stateValue.destDid) {
            if (authorizerVerKey == stateValue.destVerKey) {
                if (stateValue.role == authorizer) {
                    let PubKey = Secp256k1PublicKey.fromHex(authorizerVerKey);
                    let signer = new Secp256k1Context();
                    let status = signer.verify(
                        authorizerSignature,
                        nonce,
                        PubKey
                    );
                    return status;
                }
            }
        }
    }
    return false;
};

const issuerVerify = (
    possibleAddressValues,
    address,
    issuerDid,
    issuerVerKey,
    issuerSignature,
    nonce
) => {
    let stateValueRep = possibleAddressValues[address];
    let stateValue;
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep);
        if (issuerDid == stateValue.destDid) {
            if (issuerVerKey == stateValue.destVerKey) {
                if (
                    stateValue.role == issuer ||
                    stateValue.role == authorizer
                ) {
                    let PubKey = Secp256k1PublicKey.fromHex(issuerVerKey);
                    let signer = new Secp256k1Context();
                    let status = signer.verify(issuerSignature, nonce, PubKey);
                    return status;
                }
            }
        }
    }
    return false;
};

const requesterVerify = (
    possibleAddressValues,
    address,
    requesterDid,
    requesterVerKey,
    issuerSignature,
    nonce
) => {
    let stateValueRep = possibleAddressValues[address];
    let stateValue;
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep);
        if (requesterDid == stateValue.destDid) {
            if (requesterVerKey == stateValue.sourceVerKey) {
                let PubKey = Secp256k1PublicKey.fromHex(requesterVerKey);
                let signer = new Secp256k1Context();
                let status = signer.verify(issuerSignature, nonce, PubKey);
                return status;
            }
        }
    }
    return false;
};

const schemaVerify = (
    possibleAddressValues,
    address,
    authorizerDid,
    authorizerVerKey,
    authorizerSignature,
    nonce
) => {
    let stateValueRep = possibleAddressValues[address];
    let stateValue;
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep);
        if (authorizerDid == stateValue.sourceDid) {
            if (authorizerVerKey == stateValue.sourceVerKey) {
                let PubKey = Secp256k1PublicKey.fromHex(authorizerVerKey);
                let signer = new Secp256k1Context();
                let status = signer.verify(authorizerSignature, nonce, PubKey);
                return status;
            }
        }
    }
    return false;
};

const credentialVerify = (
    possibleAddressValues,
    address,
    issuerDid,
    issuerVerKey,
    issuerSignature,
    nonce
) => {
    let stateValueRep = possibleAddressValues[address];
    let stateValue;
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep);
        if (issuerDid == stateValue.sourceDid) {
            if (issuerVerKey == stateValue.sourceVerKey) {
                let PubKey = Secp256k1PublicKey.fromHex(issuerVerKey);
                let signer = new Secp256k1Context();
                let status = signer.verify(issuerSignature, nonce, PubKey);
                return status;
            }
        }
    }
    return false;
};

const credentialExist = (possibleAddressValues, address) => {
    let stateValueRep = possibleAddressValues[address];
    if (stateValueRep && stateValueRep.length > 0) {
        return true;
    }
    return false;
};

const requesterExist = (possibleAddressValues, address) => {
    let stateValueRep = possibleAddressValues[address];
    if (stateValueRep && stateValueRep.length > 0) {
        return true;
    }
    return false;
};

module.exports = {
    authorizerVerify,
    issuerVerify,
    requesterVerify,
    schemaVerify,
    requesterExist,
    credentialExist,
    setEntry,
};
