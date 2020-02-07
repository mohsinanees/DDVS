/*                                                                                       *  
    ----------------------------------------------------------------------------------- 
   | * This is the namespace Module for all the Request Types.                         |
   | * Here we define the procedure of generating state addresses for all the entities.|           |  
    -----------------------------------------------------------------------------------
*                                                                                       */ 
const { createHash } = require('crypto')

const request_family = 'request'
const version = '0.8.1'
const _hash = (x) =>
  createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const request_namespace = _hash(request_family).substring(20, 26)

const _genRequestAddress = (x) => request_namespace + _hash(x)

module.exports = { request_family, 
                   version, 
                   request_namespace,
                   _genRequestAddress };