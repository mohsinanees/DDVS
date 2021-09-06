/*                                                                                *  
    ----------------------------------------------------------------------------
   | * This is the Global Api for Verification methods used in all Transactions.|
   | * Here We define Global Functions to verify all the entities in DACVS i.e. | 
   |   "Issuer", "Authorizer", "Claimer".                                       |  
    ----------------------------------------------------------------------------
*                                                                                 */
const cbor = require("cbor");
var colors = require("colors");
const axios = require("axios");
const {
    Secp256k1Context,
    Secp256k1PublicKey,
} = require("sawtooth-sdk/signing/secp256k1");
const { authorizer, issuer, standard } = require("./config").roles;
const { _genDIDAddress } = require("./DID/namespace");
const { _genCredentialAddress } = require("./Credential/Definition/namespace");

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

const issuerVerifyWithHttp = async (
    issuerDid,
    issuerVerKey,
    issuerSignature,
    nonce
) => {
    let base64EncodedIssuer = await axios.get(
        `http://127.0.0.1:8008/state/${issuerDid}`
    );
    if (base64EncodedIssuer) {
        let encodedIssuer = Buffer.from(
            base64EncodedIssuer["data"]["data"],
            "base64"
        );
        if (encodedIssuer && encodedIssuer.length > 0) {
            let issuerStateValue = await cbor.decodeFirstSync(encodedIssuer);
            if (
                issuerDid === issuerStateValue.destDid &&
                issuerVerKey === issuerStateValue.destVerKey
            ) {
                if (
                    issuerStateValue.role == issuer ||
                    issuerStateValue.role == authorizer
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

const credentialVerifyWithHttp = async (credentialID) => {
    let credentialAddress = _genCredentialAddress(credentialID);
    let base64EncodedCredential = await axios.get(
        `http://127.0.0.1:8008/state/${credentialAddress}`
    );
    if (base64EncodedCredential) {
        let encodedCredential = Buffer.from(
            base64EncodedCredential["data"]["data"],
            "base64"
        );
        if (encodedCredential && encodedCredential.length > 0) {
            let credential = await cbor.decodeFirstSync(encodedCredential);
            let issuerStatus = issuerVerifyWithHttp(
                credential.sourceDid,
                credential.sourceVerKey,
                credential.issuerSignature,
                credential.nonce
            );
            if (issuerStatus) {
                let result = {
                    credential: credential,
                    credentialStatus: "Verified",
                };
                return result;
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
    credentialVerifyWithHttp,
    setEntry,
};
