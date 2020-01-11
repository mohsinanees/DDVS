
const { createHash } = require('crypto')

const DID_FAMILY = 'DID'
const VERSION = '0.8.1'
const _hash = (x) =>
  createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const DID_NAMESPACE = _hash(DID_FAMILY).substring(20, 26)

const _genDIDAddress = (x) => DID_NAMESPACE + _hash(x)

module.exports = { DID_FAMILY, 
                   VERSION, 
                   DID_NAMESPACE,
                   _genDIDAddress };