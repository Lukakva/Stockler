// Not using ES6 on Node
const http = require('http')
const TwitterRequest = require('./twitter')

http.createServer((request, response) => {
  let body = []

  request.on('data', chunk => {
    body.push(chunk)
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    new TwitterRequest(body, response)
  })
}).listen(9000, () => {
  console.log('HTTP Twitter proxy successfully launched on port 9000')
})
