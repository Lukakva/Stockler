const Twitter = require('twitter-node-client').Twitter

class TwitterRequest {
  constructor(body, response) {
    this.res = response
    this.twitter = new Twitter({
      consumerKey: 'SZnA3Da7mPuq9sznwryHpaOQQ',
      consumerSecret: 'o71tCbKBPD9GxEnujg9FmvSfmYlNMPWle2O8ybHyhO96FZqiBq',
    })

    try {
      this.body = JSON.parse(body)
      this.handle()
    } catch (e) {
      return this.error(e)
    }
  }

  json(obj, statusCode) {
    this.res.writeHead(statusCode || 200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    })

    this.res.write(JSON.stringify(obj))
    this.res.end()
  }

  error(e) {
    return this.json({
      error: e,
    }, 400)
  }

  handle() {
    let error = data => {
      try {
        this.json({
          success: false,
          data: JSON.parse(data),
        })
      } catch (e) {
        this.json({
          success: false,
          data: {
            errors: 'WELL'
          }
        })

        console.log('error', data)
      }
    }

    let success = data => {
      try {
        this.json({
          success: true,
          data: JSON.parse(data),
        })
      } catch (e) {
        console.log('success', data)
      }
    }

    // which method to call on the Twitter API Client
    let methodName = this.body.method
    this.twitter[methodName](this.body.params, error, success)
  }
}

module.exports = TwitterRequest
