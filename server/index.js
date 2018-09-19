// Not using ES6 on Node
const http = require('http')
const TwitterProxy = require('./twitter-proxy')

const RequestHandler = (request, response) => {
  let body = []

  request.on('data', chunk => {
    body.push(chunk)
  }).on('end', () => {
    body = Buffer.concat(body).toString()

    let proxy = new TwitterProxy(response)
    proxy.handle(body)
  })
}

http.createServer(RequestHandler).listen(9000, () => {
  console.log('HTTP Twitter proxy successfully launched on port 9000')
})
