/*                                                                                    *  
    ------------------------------------------------------------------------------- 
   | This is the bridge Module that registers Transaction Family to the Validator. | 
    ------------------------------------------------------------------------------- 
*                                                                                     */
'use strict'

const { TransactionProcessor } = require('sawtooth-sdk/processor')
const RequestHandler = require('./handler')
const { TP_ADDR } = require('../config')

// if (process.argv.length < 3) {
//   console.log('missing a validator address')
//   process.exit(1)
// }

const address = TP_ADDR//process.argv[2]

const transactionProcessor = new TransactionProcessor(address)

transactionProcessor.addHandler(new RequestHandler())

transactionProcessor.start()
