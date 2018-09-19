const Twitter = require('twitter-node-client').Twitter

class TwitterProxy {
  constructor(response) {
    this.res = response
    this.twitter = new Twitter({
      consumerKey: 'SZnA3Da7mPuq9sznwryHpaOQQ',
      consumerSecret: 'o71tCbKBPD9GxEnujg9FmvSfmYlNMPWle2O8ybHyhO96FZqiBq',
    })

    this.errorCallback = this.errorCallback.bind(this)
    this.successCallback = this.successCallback.bind(this)
  }

  json(obj, statusCode) {
    this.res.writeHead(statusCode || 200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    })

    this.res.write(JSON.stringify(obj))
    this.res.end()
  }

  /* Twitter API library has an error callback */
  errorCallback(data) {
    try {
      this.json({
        success: false,
        data: JSON.parse(data),
      })
    } catch (e) {
      this.json({
        success: false,
        data: 'There was an error while parsing the previous error :(',
      })

      console.log('error', data)
    }
  }

  successCallback(data) {
    try {
      this.json({
        success: true,
        data: JSON.parse(data),
      })
    } catch (e) {
      console.log('success', data)
    }
  }

  handle(bodyStr) {
    let body = null

    try {
      body = JSON.parse(bodyStr)
    } catch (e) {
      return this.error({
        success: false,
        data: 'Invalid JSON input. ' + e,
      }, 400)
    }

    // which method to call on the Twitter API Client
    let methodName = body.method
    this.twitter[methodName](body.params, this.errorCallback, this.successCallback)
  }
}

module.exports = TwitterProxy
