// redirects Twitter functions to a custom proxy server
// (well, only functions that I need)
export default class Twitter {
  constructor() {
    this.url = window.location.protocol + '//' + window.location.hostname + ':' + 9000

    let methods = [
      'getSearch',
      'getCustomApiCall',
    ]

    // creates a dull function that just calls the proxy method
    methods.map(methodName => {
      this[methodName] = function() {
        return this.proxy(methodName, arguments)
      }
    })
  }

  /* Sends a request to the Node.js server, telling it to call the 'methodName' method on the Twitter API JS Client */
  proxy(methodName, params) {
    let data = {
      method: methodName,
      params: Array.prototype.slice.call(params),
    }

    // only using resolve, since this promise is always getting resolved
    // (might be a bad practice, but handling errors gets exponentially harder)
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
