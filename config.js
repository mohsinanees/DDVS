
module.exports = {
    DEBUG: "DEBUG",
    WARN: "WARN",
    TP_ADDR: 'tcp://127.0.0.1:4004',
    BATCH_URL: 'http://127.0.0.1:8008/batches',
    Log_Dir: '/home/mohsin/logs',
    request_type: {
        conection_request: 'Connection',
        authorization_request: 'Authorization',
        cred_claim_request: 'CredentialClaim'
    },
    roles: {
        authorizer: "authorizer",
        issuer: "issuer",
        standard: "standard"
    }
}