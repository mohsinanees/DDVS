
const { createHash } = require('crypto')

const credDef_family = 'credential'
const version = '0.8.1'
const _hash = (x) =>
  createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const credDef_namespace = _hash(credDef_family).substring(20, 26)

const _genCredentialAddress = (x) => credDef_namespace + _hash(x)

module.exports = { credDef_family, 
                   version, 
                   credDef_namespace,
                   _genCredentialAddress };