
const SQL = require('./sql')
const sql = new SQL()
sql.readRecords(limit = 1, offset = 0).then((res) => {
  console.log(res)
})

// const request = require('request')
// request.get({
//     url: 'http://127.0.0.1:8008/transactions',
//     qs: parameters,
//     headers: { 'Content-Type': 'application/octet-stream' }
//   }, (err, response) => {
//     if (err) return console.log(err)
//     //let arr = Array.from(response.body)
//     console.log(response.body)
//     // let arr = response.body.split("},")
//     // console.log(arr.length)
//     // arr = arr.filter(trans => trans.includes("62c1003278634dd31221fb390d4808aef34747d755b18582b516f054d3d9ff2e2889f5"))
//     // console.log(arr[1])
    
//   })