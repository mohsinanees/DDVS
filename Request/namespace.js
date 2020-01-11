
const { createHash } = require('crypto')

const Request_family = 'request'
const version = '0.8.1'
const _hash = (x) =>
  createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const Request_namespace = _hash(Request_family).substring(20, 26)

const _genRequestAddress = (x) => Request_namespace + _hash(x)

module.exports = { Request_family, 
                   version, 
                   Request_namespace,
                   _genRequestAddress };