const request = require('request')
const requestOptions = {
  url: 'https://api.twitter.com/oauth2/token',
  method: 'POST',
  headers: {
    'Authorization': 'Basic ', // + base64 encoded token
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  },
  body: 'grant_type=client_credentials',
}

const getBearerToken = (key, secret) => {
  const token = encodeURIComponent(key) + ':' + encodeURIComponent(secret)
  const base64 = Buffer.from(token).toString('base64')

  requestOptions.headers.Authorization += base64

  return new Promise(resolve => {
    request(requestOptions, function(error, response, body) {
      let json = {}

      try {
        json = JSON.parse(body)
        resolve(json.access_token)
      } catch (e) {
        console.log(error, e)
        resolve(false)
      }
    })
  })
}

module.exports = getBearerToken
