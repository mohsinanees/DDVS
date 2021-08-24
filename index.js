/*                                                                                      *  
    ---------------------------------------------------------------------------------- 
   | * This is the main application for demo of whole Project.                        |
   | * It uses all of the modules and Transaction Families to demonstrate the working | 
   |   of "Decentralized Academic Credentials Verification System".                   |  
    ----------------------------------------------------------------------------------
*                                                                                       */
const express = require('express');
const cors = require("cors");
const { createContext, CryptoFactory } = require('sawtooth-sdk/signing');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { createHash } = require('crypto');
const BodyParser = require('body-parser');
const { submitRequest, submitAuthorizationRequest } = require("./Request/submitRequest");
const submitDid = require("./DID/submitDID");
const submitSchema = require("./Credential/Schema/submitSchema");
const submitCredential = require("./Credential/Definition/submitCred");
const { _genDIDAddress } = require("./DID/namespace");
const { roles } = require("./config");
const { error } = require('console');

const app = express();
const PORT = 7000
app.options('*', cors());
app.use(cors());
app.use(BodyParser.json({ limit: `50mb` }))

const init = () => {
    // generate authorizer
    var authorizerPrivatekey = Secp256k1PrivateKey.newRandom();
    let authorizerContext = createContext('secp256k1');
    var authorizerObj = new CryptoFactory(authorizerContext);
    var authorizer = authorizerObj.newSigner(authorizerPrivatekey);
    var authorizerVerKey = authorizer.getPublicKey().asHex();
    var authorizerDid = _genDIDAddress(authorizerVerKey);
    let authorizernonce = createHash('sha256').update(JSON.stringify({ authorizerDid, authorizerVerKey })).digest('hex');
    let authorizerSignature = authorizer.sign(Buffer.from(authorizernonce));
    let authorizerDidStatus = submitDid(authorizerPrivatekey.asHex(), authorizerDid, authorizerVerKey,
        authorizerDid, authorizerVerKey, authorizernonce, authorizerSignature, roles.authorizer);
    if(!authorizerDidStatus) {
        throw error;
    }

    // generate issuer
    var issuerPrivateKey = Secp256k1PrivateKey.newRandom();
    let issuerContext = createContext('secp256k1');
    var issuerObj = new CryptoFactory(issuerContext);
    var issuer = issuerObj.newSigner(issuerPrivateKey);
    var issuerVerKey = issuer.getPublicKey().asHex();
    var issuerDid = _genDIDAddress(issuerVerKey);
    let issuernonce = createHash('sha256').update(JSON.stringify({ issuerDid, issuerVerKey })).digest('hex');
    let authorizerSignatureForIssuer = authorizer.sign(Buffer.from(issuernonce));
    let issuerDidStatus = submitDid(authorizerPrivatekey.asHex(), authorizerDid, authorizerVerKey,
        issuerDid, issuerVerKey, issuernonce, authorizerSignatureForIssuer, roles.issuer);
    if(!issuerDidStatus) {
        throw error;
    }

    // generate student
    var studentPrivateKey = Secp256k1PrivateKey.newRandom();
    let studentContext = createContext('secp256k1');
    var studentObj = new CryptoFactory(studentContext);
    var student = studentObj.newSigner(studentPrivateKey);
    var studentVerKey = student.getPublicKey().asHex();
    var studentDid = _genDIDAddress(studentVerKey);
}

app.post('/request/connection/', async (req, res) => {
    console.log(req.body);
    let requestData = req.body;
    let type = requestData.type;
    let requesterDid = requestData.sourceDid;
    let requesterVerKey = requestData.sourceVerKey;
    let destDid = requestData.destDid;
    let destVerKey = requestData.destVerKey;
    let nonce = requestData.nonce;
    let requesterSignature = requestData.signature;
    try {
        let requestStatus = submitRequest(issuerPrivateKey.asHex(), studentPrivateKey.asHex(), type, requesterDid, requesterVerKey, destDid,
            destVerKey, nonce, requesterSignature)
        // console.log(requestStatus)    
        if (requestStatus) {
            let issuerSignature = issuer.sign(Buffer.from(nonce));
            let didStatus = submitDid(issuerPrivateKey.asHex(), issuerDid, issuerVerKey, requesterDid, requesterVerKey,
                nonce, issuerSignature, roles.standard);
            if (didStatus) {
                res.status(200).send({
                    status: "OK",
                    sourceDid: issuerDid,
                    destDid: requesterDid
                })
            } else {
                res.status(402).send("Connection Failed")
            }
        }
    } catch (err) {
        console.log(err)
        res.status(400).send("Request failed")
    }

});

app.get('/request/credential/', async (req, res) => {
    console.log(req.query)
    let requestData = req.query
    let type = requestData.type
    let requesterDid = requestData.sourceDid
    let requesterVerKey = requestData.sourceVerKey
    let destDid = requestData.destDid
    let destVerKey = requestData.destVerKey
    let nonce = requestData.nonce
    let requesterSignature = requestData.signature
    try {
        let requestStatus = submitRequest(issuerPrivateKey.asHex(), studentPrivateKey.asHex(), type, requesterDid, requesterVerKey, destDid,
            destVerKey, nonce, requesterSignature)
        // console.log(requestStatus)    
        if (requestStatus) {
            let authorizerSignature = authorizer.sign(Buffer.from(nonce));
            let schemaVersion = '0.7'
            let title = 'Transcript'
            let attributes = {
                institute: "institute_Name",
                name: "student_name",
                cnic: "cnic",
                regid: "registration_number",
                level: "level",
                totalmarks: "total_marks",
                obtainedmarks: "obtained_marks",
                subjects: "subjects",
                subjectmarks: "subject_marks",
                passingyear: "passing_year"
            }
            let schemaStatus = submitSchema(authorizerPrivatekey.asHex(), authorizerDid, authorizerVerKey, schemaVersion, title, nonce,
                authorizerSignature, attributes)
            if (schemaStatus) {
                let requestType = "authorization"
                let schemaID = "618fb7579b2c52381fe9c2413ca410ca1c023995b10cb6a247144774f1498b82"
                let credentialTitle = "Transcript"
                let credentialBody = {
                    institute_name: "COMSATS",
                    student_name: "Mohsin Anees Khan",
                    registration_number: "SP16-BCS-184",
                    student_cnic: "35202-3642273-3",
                    level: "Under-Grad",
                    total_marks: "1050",
                    obtained_marks: "994",
                    subjects: "Computer Science",
                    passing_year: "2020"
                }
                nonce = createHash('sha256').update(JSON.stringify(credentialBody)).digest('hex')
                let issuerSignature = issuer.sign(Buffer.from(nonce))
                requestStatus = submitAuthorizationRequest(authorizerPrivatekey.asHex(), studentPrivateKey.asHex(), requestType, issuerDid, issuerVerKey,
                    requesterDid, requesterVerKey, schemaID, credentialTitle, credentialBody,
                    nonce, issuerSignature);
                if (requestStatus) {
                    authorizerSignature = authorizer.sign(Buffer.from(nonce))
                    let credentialStatus = submitCredential(authorizerPrivatekey.asHex(), authorizerDid, authorizerVerKey,
                        issuerDid, issuerVerKey, requesterDid, requesterVerKey, schemaID,
                        schemaVersion, credentialTitle, nonce, issuerSignature,
                        authorizerSignature, credentialBody)
                    if (credentialStatus) {
                        res.status(200).send({
                            authorizerDid: authorizerDid,
                            authorizerVerKey: authorizerVerKey,
                            issuerDid: issuerDid,
                            issuerVerKey: issuerVerKey,
                            requesterDid: requesterDid,
                            requesterVerKey: requesterVerKey,
                            schemaID: schemaID,
                            schemaVersion: schemaVersion,
                            credentialID: createHash('sha256').update(JSON.stringify([credentialBody.student_name,
                            credentialBody.student_cnic, credentialBody.level])).digest("hex"),
                            credentialTitle: credentialTitle,
                            nonce: nonce,
                            issuerSignature: issuerSignature,
                            authorizerSignature: authorizerSignature,
                            credentialBody: credentialBody
                        })
                    } else {
                        res.status(404).send("Requested Credential not available")
                    }
                } else {
                    res.status(400).send("Invalid request")
                }
            } else {
                res.status(404).send("Schema does not exist")
            }
        } else {
            res.status(400).send("Invalid request")
        }
    } catch (err) {
        console.log(err)
        res.status(402).send("Connection Failed")
    }

});

app.listen(PORT, () => {
    try {
        init();
    } catch(err) {
        console.log(err);
    }
    console.log(`server running on port ${PORT}`)
});