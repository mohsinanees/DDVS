/*                                                                                      *  
    ---------------------------------------------------------------------------------- 
   | * This is the main application for demo of whole Project.                        |
   | * It uses all of the modules and Transaction Families to demonstrate the working | 
   |   of "Decentralized Academic Credentials Verification System".                   |  
    ----------------------------------------------------------------------------------
*                                                                                       */
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cbor = require("cbor");
const fs = require("fs");
const { createContext, CryptoFactory } = require("sawtooth-sdk/signing");
const {
    Secp256k1PrivateKey,
    Secp256k1PublicKey,
} = require("sawtooth-sdk/signing/secp256k1");
const { createHash } = require("crypto");
const BodyParser = require("body-parser");
const {
    submitRequest,
    submitAuthorizationRequest,
} = require("./Request/submitRequest");
const submitDid = require("./DID/submitDID");
const submitSchema = require("./Credential/Schema/submitSchema");
const submitCredential = require("./Credential/Definition/submitCred");
const { _genDIDAddress } = require("./DID/namespace");
const { roles, request_type } = require("./config");
const { credentialVerifyWithHttp } = require("./verify");
const { error } = require("console");
const { json } = require("express");

const app = express();
const PORT = 7000;
app.options("*", cors());
app.use(cors());
app.use(BodyParser.json({ limit: `50mb` }));

var authorizerPrivatekey = null;
var authorizer = null;
var authorizerVerKey = null;
var authorizerDid = null;

var issuerPrivateKey = null;
var issuer = null;
var issuerVerKey = null;
var issuerDid = null;

var studentPrivateKey = null;
var student = null;
var studentVerKey = null;
var studentDid = null;

const init = () => {
    // generate private keys for the users
    authorizerPrivatekey = Secp256k1PrivateKey.newRandom();
    issuerPrivateKey = Secp256k1PrivateKey.newRandom();
    studentPrivateKey = Secp256k1PrivateKey.newRandom();

    // generate authorizer
    let authorizerContext = createContext("secp256k1");
    let authorizerObj = new CryptoFactory(authorizerContext);
    authorizer = authorizerObj.newSigner(authorizerPrivatekey);
    authorizerVerKey = authorizer.getPublicKey().asHex();
    authorizerDid = _genDIDAddress(authorizerVerKey);
    let authorizernonce = createHash("sha256")
        .update(JSON.stringify({ authorizerDid, authorizerVerKey }))
        .digest("hex");
    let authorizerSignature = authorizer.sign(Buffer.from(authorizernonce));

    try {
        let authorizerDidStatus = submitDid(
            authorizerPrivatekey.asHex(),
            authorizerDid,
            authorizerVerKey,
            authorizerDid,
            authorizerVerKey,
            authorizernonce,
            authorizerSignature,
            roles.authorizer
        );
    } catch (err) {
        console.log(err);
        throw err;
    }

    // generate issuer
    let issuerContext = createContext("secp256k1");
    let issuerObj = new CryptoFactory(issuerContext);
    issuer = issuerObj.newSigner(issuerPrivateKey);
    issuerVerKey = issuer.getPublicKey().asHex();
    issuerDid = _genDIDAddress(issuerVerKey);
    let issuernonce = createHash("sha256")
        .update(JSON.stringify({ issuerDid, issuerVerKey }))
        .digest("hex");
    let authorizerSignatureForIssuer = authorizer.sign(
        Buffer.from(issuernonce)
    );

    try {
        let issuerDidStatus = submitDid(
            authorizerPrivatekey.asHex(),
            authorizerDid,
            authorizerVerKey,
            issuerDid,
            issuerVerKey,
            issuernonce,
            authorizerSignatureForIssuer,
            roles.issuer
        );
    } catch (err) {
        console.log(err);
        throw error;
    }

    // generate student
    let studentContext = createContext("secp256k1");
    let studentObj = new CryptoFactory(studentContext);
    student = studentObj.newSigner(studentPrivateKey);
    studentVerKey = student.getPublicKey().asHex();
    studentDid = _genDIDAddress(studentVerKey);

    // write addresses to file
    const data = {
        authorizerPrivatekey: authorizerPrivatekey.asHex(),
        authorizerVerKey: authorizerVerKey,
        authorizerDid: authorizerDid,
        issuerPrivateKey: issuerPrivateKey.asHex(),
        issuerVerKey: issuerVerKey,
        issuerDid: issuerDid,
        studentPrivateKey: studentPrivateKey.asHex(),
        studentVerKey: studentVerKey,
        studentDid: studentDid,
    };
    fs.writeFile("addresses.json", JSON.stringify(data, null, 2), (err) => {
        // In case of a error throw err.
        if (err) throw err;
    });
};

const initWithObject = (addressesObject) => {
    addressesObjectJSON = JSON.parse(addressesObject);

    // initialize authorizer
    authorizerPrivatekey = Secp256k1PrivateKey.fromHex(
        addressesObjectJSON["authorizerPrivatekey"]
    );
    let authorizerContext = createContext("secp256k1");
    let authorizerObj = new CryptoFactory(authorizerContext);
    authorizer = authorizerObj.newSigner(authorizerPrivatekey);
    authorizerVerKey = authorizer.getPublicKey().asHex();
    authorizerDid = addressesObjectJSON["authorizerDid"];

    // initialize issuer
    issuerPrivateKey = Secp256k1PrivateKey.fromHex(
        addressesObjectJSON["issuerPrivateKey"]
    );
    let issuerContext = createContext("secp256k1");
    let issuerObj = new CryptoFactory(issuerContext);
    issuer = issuerObj.newSigner(issuerPrivateKey);
    issuerVerKey = issuer.getPublicKey().asHex();
    issuerDid = addressesObjectJSON["issuerDid"];

    // initialize student
    studentPrivateKey = Secp256k1PrivateKey.fromHex(
        addressesObjectJSON["studentPrivateKey"]
    );
    let studentContext = createContext("secp256k1");
    let studentObj = new CryptoFactory(studentContext);
    student = studentObj.newSigner(studentPrivateKey);
    studentVerKey = student.getPublicKey().asHex();
    studentDid = addressesObjectJSON["studentDid"];
};

app.post("/request/connection/", async (req, res) => {
    console.log(req.body);
    let requestData = req.body;
    let type = requestData.type;
    let requesterDid = requestData.requesterDid;
    let requesterVerKey = requestData.requesterVerKey;
    let destDid = requestData.destDid;
    let destVerKey = requestData.destVerKey;
    let nonce = requestData.nonce;
    let requesterSignature = requestData.requesterSignature;

    try {
        submitRequest(
            issuerPrivateKey.asHex(),
            studentPrivateKey.asHex(),
            type,
            requesterDid,
            requesterVerKey,
            destDid,
            destVerKey,
            nonce,
            requesterSignature
        );
    } catch (err) {
        console.log(err);
        res.status(400).send("Request failed");
        throw err;
    }
    // console.log(requestStatus)
    try {
        let issuerSignature = issuer.sign(Buffer.from(nonce));
        submitDid(
            issuerPrivateKey.asHex(),
            issuerDid,
            issuerVerKey,
            requesterDid,
            requesterVerKey,
            nonce,
            issuerSignature,
            roles.standard
        );
        res.status(200).send({
            status: "Connection successful",
            sourceDid: issuerDid,
            destDid: requesterDid,
        });
    } catch (err) {
        console.log(err);
        res.status(400).send("DID registration failed");
        throw err;
    }
});

app.get("/request/credential/", async (req, res) => {
    let requestData = req.query;
    let type = requestData.type;
    let requesterDid = requestData.sourceDid;
    // console.log(requesterDid);
    let requesterVerKey = requestData.sourceVerKey;
    let destDid = requestData.destDid;
    let destVerKey = requestData.destVerKey;
    let nonce = requestData.nonce;
    let requesterSignature = requestData.signature;
    try {
        let requestStatus = submitRequest(
            issuerPrivateKey.asHex(),
            studentPrivateKey.asHex(),
            type,
            requesterDid,
            requesterVerKey,
            destDid,
            destVerKey,
            nonce,
            requesterSignature
        );
        if (requestStatus) {
            let authorizerSignature = authorizer.sign(Buffer.from(nonce));
            let schemaVersion = "0.7";
            let title = "Transcript";
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
                passingyear: "passing_year",
            };
            let schemaStatus = submitSchema(
                authorizerPrivatekey.asHex(),
                authorizerDid,
                authorizerVerKey,
                schemaVersion,
                title,
                nonce,
                authorizerSignature,
                attributes
            );
            if (schemaStatus) {
                let requestType = request_type.authorization_request;
                let schemaID =
                    "618fb7579b2c52381fe9c2413ca410ca1c023995b10cb6a247144774f1498b82";
                let credentialTitle = "Transcript";
                let credentialBody = {
                    institute_name: "ITU",
                    student_name: "Ali Khan",
                    registration_number: "F16-MSCS-184",
                    student_cnic: "35202-3642273-3",
                    level: "Grad",
                    total_marks: "4.0",
                    obtained_marks: "3.5",
                    subjects: "Computer Science",
                    passing_year: "2020",
                };
                nonce = createHash("sha256")
                    .update(JSON.stringify(credentialBody))
                    .digest("hex");
                let issuerSignature = issuer.sign(Buffer.from(nonce));
                requestStatus = submitAuthorizationRequest(
                    issuerPrivateKey.asHex(),
                    studentPrivateKey.asHex(),
                    requestType,
                    issuerDid,
                    issuerVerKey,
                    requesterDid,
                    requesterVerKey,
                    schemaID,
                    credentialTitle,
                    credentialBody,
                    nonce,
                    issuerSignature
                );
                if (requestStatus) {
                    authorizerSignature = authorizer.sign(Buffer.from(nonce));
                    let credentialStatus = submitCredential(
                        authorizerPrivatekey.asHex(),
                        authorizerDid,
                        authorizerVerKey,
                        issuerDid,
                        issuerVerKey,
                        requesterDid,
                        requesterVerKey,
                        schemaID,
                        schemaVersion,
                        credentialTitle,
                        nonce,
                        issuerSignature,
                        authorizerSignature,
                        credentialBody
                    );
                    if (credentialStatus) {
                        let credentialResponse = {
                            authorizerDid: authorizerDid,
                            authorizerVerKey: authorizerVerKey,
                            issuerDid: issuerDid,
                            issuerVerKey: issuerVerKey,
                            requesterDid: requesterDid,
                            requesterVerKey: requesterVerKey,
                            schemaID: schemaID,
                            schemaVersion: schemaVersion,
                            credentialID: createHash("sha256")
                                .update(
                                    JSON.stringify([
                                        credentialBody.student_name,
                                        credentialBody.student_cnic,
                                        credentialBody.level,
                                    ])
                                )
                                .digest("hex"),
                            credentialTitle: credentialTitle,
                            nonce: nonce,
                            issuerSignature: issuerSignature,
                            authorizerSignature: authorizerSignature,
                            credentialBody: credentialBody,
                        };
                        fs.writeFile(
                            "credential.json",
                            JSON.stringify(credentialResponse, null, 2),
                            (err) => {
                                console.log(err);
                            }
                        );
                        res.status(200).send(credentialResponse);
                    } else {
                        res.status(404).send(
                            "Requested Credential not available"
                        );
                    }
                } else {
                    res.status(400).send("Invalid request");
                }
            } else {
                res.status(404).send("Schema does not exist");
            }
        } else {
            res.status(400).send("Invalid request");
        }
    } catch (err) {
        console.log(err);
        res.status(402).send("Credential request failed");
    }
});

app.get("/verify", async (req, res) => {
    let credentialID = req.query.credentialID;
    try {
        let result = await credentialVerifyWithHttp(credentialID);
        if (result) {
            console.log(result);
            res.status(200).send({
                credential: result.credential,
                Status: result.credentialStatus,
            });
        }
    } catch (err) {
        console.log(err);
        res.status(400).send("Invalid Credential");
    }
});

app.listen(PORT, () => {
    try {
        let addressesObject = fs.readFileSync("./addresses.json", "utf-8");
        // console.log(addressesObject);
        if (addressesObject) {
            initWithObject(addressesObject);
        } else {
            init();
        }
    } catch (err) {
        try {
            init();
        } catch (err) {
            console.log(err);
        }
    }
    console.log(`server running on port ${PORT}`);
});
