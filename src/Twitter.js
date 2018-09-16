// redirects Twitter functions to a custom proxy server
// (well, only functions that I need)
export default class Twitter {
  constructor() {
    this.url = 'http://localhost:9000/'

    let methods = [
      'getSearch',
    ]

    // creates a dull function that just calls the proxy method
    methods.map(methodName => {
      this[methodName] = (params, error, success) => {
        let data = JSON.stringify(params)
        this.proxy(methodName, params, error, success)
      }
    })
  }

  /* Sends a request to the Node.js server, telling it to call the 'methodName' method on the Twitter API JS Client */
  proxy(methodName, params, error, success) {
    let data = {
      method: methodName,
      params: params,
    }

    let callbacks = {
      error: error,
      success: success,
    }

    fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(response => {
      return response.text()
    }).then(response => {
      console.log(response)
      try {
        let json = JSON.parse(response)
        let callbackName = json.callback

        if (callbacks[callbackName]) {
          callbacks[callbackName](json.data);
        }
      } catch (e) {
        return error(e)
      }

      success(response)
    }).catch(err => {
      error(err)
    })
  }
}
