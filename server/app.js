// Not using ES6 on Node
const log = console.log
const http = require('http')
const socket = require('socket.io')
const Twitter = require('twitter')
const TwitterProxy = require('./twitter-proxy')
const getBearerToken = require('./oauth')

const Credentials = {
  key: 'SZnA3Da7mPuq9sznwryHpaOQQ',
  secret: 'o71tCbKBPD9GxEnujg9FmvSfmYlNMPWle2O8ybHyhO96FZqiBq',
}

class App {
  constructor() {
    // a dictionary where key is a stock symbol
    // and value is a socket object
    this.symbolListeners = {
      // AAPL: [Socket, Socket, Socket],
      // TSLA: [Socket, Socket, Socket],
    }

    this.twitter = new Twitter({
      consumer_key: 'SZnA3Da7mPuq9sznwryHpaOQQ',
      consumer_secret: 'o71tCbKBPD9GxEnujg9FmvSfmYlNMPWle2O8ybHyhO96FZqiBq',
      access_token_key: '900440131-1j9Nan4oGoZbYPQWUot7nHV6T6AzBQkXG2D7iua3',
      access_token_secret: 'VBcASknER4LytwSsHXQ9UyTMPC5WAxxS0hdRLnjlbcp5m'
    })
    this.stream = null
  }

  async init() {
    let stream = twitter.stream('statuses/filter', {track: '$AAPL'})
    stream.on('data', event => {
      console.log(event)
    })

    stream.on('error', err => {
      console.log(err)
    })
    this.initServer()
  }

  init() {
    this.server = http.createServer()
    this.io = socket(this.server)

    this.io.on('connection', client => {
      console.log('Aw Yeah! A new client', client.id)

      client.on('addListener', symbol => {
        if (this.symbolListeners[symbol] instanceof Array === false) {
          this.symbolListeners[symbol] = []
        }

        if (this.symbolListeners[symbol].indexOf(client) > -1) return

        this.symbolListeners[symbol].push(client)
        this.setupStream()
      })

      client.on('removeListener', symbol => {
        if (this.symbolListeners[symbol] instanceof Array === false) return

        let index = this.symbolListeners[symbol].indexOf(client)
        if (index > -1) {
          this.symbolListeners[symbol].splice(index, 1)
        }
        this.setupStream()
      })

      client.on('disconnect', () => {
        // remove this client from every symbol listener
        for (let symbol in this.symbolListeners) {
          if (this.symbolListeners[symbol] instanceof Array === false) continue
          let index = this.symbolListeners[symbol].indexOf(client)
          if (index > -1) {
            this.symbolListeners[symbol].splice(index, 1)
          }
        }
      })
    })

    this.server.listen(9000, () => {
      log('HTTP and Socket were successfully launched on port 9000')
    })
  }

  /*
    sets up a twitter stream that will listen to current symbols

    (gets called every time a new symbol is added)
  */
  setupStream() {
    if (this.stream) {
      this.stream.destroy()
      this.stream = null
    }

    let symbols = []
    for (let symbol in this.symbolListeners) {
      let value = this.symbolListeners[symbol]
      if (!value || !value.length) {
        delete this.symbolListeners[symbol]
        continue
      }

      symbols.push('$' + symbol)
    }

    if (symbols.length === 0) {
      return console.log('No symbols to listen to. Waiting...')
    }

    console.log('Re-Created the twitter stream. Tracking following items:', symbols.join(', '))

    this.stream = this.twitter.stream('statuses/filter', {
      track: symbols.join(','),
      tweet_mode: 'extended',
      exclude_replies: true,
      result_type: 'mixed',
    })

    this.stream.on('data', this.handleTweet.bind(this))
    this.stream.on('error', this.handleStreamError.bind(this))
  }

  /*
    Handles tweets and their sorting
  */
  handleTweet(tweet) {
    if (typeof tweet.id_str !== 'string') return console.log(tweet)
    if (tweet.retweeted_status) {
      tweet = tweet.retweeted_status
    }

    let entities = tweet.entities
    if (tweet.extended_tweet) {
      entities = tweet.extended_tweet.entities
    }

    // list of matched symbols by the current tweet
    let matchedSymbols = entities.symbols.map(symbol => symbol.text)
    matchedSymbols.forEach(symbol => {
      let sockets = this.symbolListeners[symbol]
      if (sockets instanceof Array === false) {
        return
      }

      sockets.forEach(socket => {
        socket.emit('data', {
          symbol: symbol,
          tweet: tweet,
        })
      })
    })
  }

  handleStreamError(err) {
    console.log(err)
  }
}

module.exports = App
