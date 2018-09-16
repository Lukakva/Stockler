// redirects Twitter functions to a custom proxy server
// (well, only functions that I need)
export default class Twitter {
  constructor() {
    this.url = window.location.protocol + '//' + window.location.hostname + ':' + 9000

    let methods = [
      'getSearch',
    ]

    // creates a dull function that just calls the proxy method
    methods.map(methodName => {
      this[methodName] = (params, error, success) => {
        let data = JSON.stringify(params)
        return this.proxy(methodName, params, error, success)
      }
    })
  }

  /* Sends a request to the Node.js server, telling it to call the 'methodName' method on the Twitter API JS Client */
  proxy(methodName, params) {
    let data = {
      method: methodName,
      params: params,
    }

    return new Promise(resolve => {
      fetch(this.url, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(response => {
        return response.text()
      }).then(response => {
        try {
          let json = JSON.parse(response)
          resolve(json)
        } catch (e) {
          resolve({
            success: false,
            data: e,
          })
        }
      }).catch(err => {
        resolve({
          success: false,
          data: err,
        })
      })
    })
  }
}
