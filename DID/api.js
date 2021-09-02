const express = require("express");
const cors = require("cors");
const BodyParser = require(`body-parser`);
const submitRequest = require("./client");

const app = express();
const PORT = 5000;
app.options("*", cors());
app.use(cors());
app.use(BodyParser.json({ limit: `50mb` }));

app.post("/request/connection/", async (req, res) => {
    let requestData = req.body;
    let type = requestData.type;
    let sourceDid = requestData.sourceDid;
    let sourceVerKey = requestData.sourceVerKey;
    let destDid = requestData.destDid;
    let destVerKey = requestData.destVerKey;
    let nonce = requestData.nonce;
    let signature = requestData.signature;
    try {
        let status = submitRequest(
            type,
            sourceDid,
            sourceVerKey,
            destDid,
            destVerKey,
            nonce,
            signature
        );
        res.status(200).send("Connection OK");
    } catch (err) {
        console.log(err);
        res.status(400).send("Connection Failed");
    }
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
