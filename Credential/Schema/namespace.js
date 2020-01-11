
const { createHash } = require('crypto')

const schema_family = 'schema'
const version = '0.8.1'
const _hash = (x) =>
  createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const schema_namespace = _hash(schema_family).substring(20, 26)

const _genSchemaAddress = (x) => schema_namespace + _hash(x)

module.exports = { schema_family, 
                   version, 
                   schema_namespace,
                   _genSchemaAddress };