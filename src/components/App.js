import React from 'react'
import ReactDOM from 'react-dom';
import Tweet from './Tweet'

import '../css/App.css'

const copy = obj => JSON.parse(JSON.stringify(obj))

// update once in 30 seconds
const UpdateInterval = 30 * 1000
const TweetDisplayOptions = {
  cards: false,
  width: '100%',
  theme: 'dark',
  conversation: 'none',
}

class App extends React.Component {
  constructor(props) {
    super(props)

    this.socket = window.io(window.location.protocol + '//' + window.location.hostname + ':9000')
    this.socket.on('data', this.handleTweets.bind(this))

    this.state = {
      inputIsValid: true,
      isFullScreen: false,
      darkMode: false,
      tweets: {
        // AAPL: ['id1', 'id2'],
        // TSLA: [],
      }
    }
  }

  inputIsInvalid() {
    this.setState({
      inputIsValid: false,
    })
  }

  inputIsValid() {
    this.setState({
      inputIsValid: true,
    })
  }

  onInputKeydown(e) {
    let keyCode = e.keyCode || e.which
    // enter
    if (keyCode === 13) {
      this.listen()
    }
  }

  toggleFullScreen() {
    this.setState({
      isFullScreen: !this.state.isFullScreen,
    })
  }

  toggleDarkMode() {
    this.setState({
      darkMode: !this.state.darkMode,
    })
  }

  addSymbol(symbol) {
    if (typeof symbol !== 'string') return

    symbol = symbol.trim()
    if (symbol.length === 0) return
    if (this.state.tweets[symbol]) return

    // just to re-render stuff
    let tweets = copy(this.state.tweets)
    tweets[symbol] = []

    this.setState({
      tweets: tweets,
    })

    this.socket.emit('addListener', symbol)
  }

  removeSymbol(symbol) {
    let tweets = copy(this.state.tweets)
    delete tweets[symbol]

    // stop fetching 'real-time' statuses about this symbol
    this.socket.emit('removeListener', symbol)

    this.setState({
      tweets: tweets,
    })
  }

  async listen() {
    let symbols = this.refs.symbolInput.value
    if (!symbols.length) {
      return this.inputIsInvalid()
    }

    this.refs.symbolInput.value = ''
    symbols.split(',').map(this.addSymbol.bind(this))
  }

  handleTweets(data) {
    let symbol = data.symbol
    let tweets = data.tweets

    let stateTweets = copy(this.state.tweets)
    if (stateTweets[symbol] instanceof Array === false) {
      stateTweets[symbol] = []
    }

    tweets.map(tweet => stateTweets[symbol].unshift(tweet))

    this.setState({
      tweets: stateTweets,
    })
  }

  renderTweets() {
    let theme = this.state.darkMode ? 'dark' : 'light'
    let ids = []

    let containers = Object.keys(this.state.tweets).map(symbol => {
      let tweets = []

      this.state.tweets[symbol].map(tweet => {
        let id = tweet.id_str
        if (tweets.indexOf(id) > -1) return
        ids.push(id)

        return <Tweet tweet={tweet} theme={theme} key={id_str} />
      })

      return (
        <div id={symbol} key={symbol} className='tweets-symbol-container'>
          <div className='symbol'>
            <span>$ {symbol}</span>
            <span className='remove' onClick={() => this.removeSymbol(symbol)}>
              <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" version="1.1"><g id="surface1"><path d="M 3.726563 3.023438 L 3.023438 3.726563 L 7.292969 8 L 3.023438 12.269531 L 3.726563 12.980469 L 8 8.707031 L 12.269531 12.980469 L 12.980469 12.269531 L 8.707031 8 L 12.980469 3.726563 L 12.269531 3.023438 L 8 7.292969 Z "></path></g></svg>
            </span>
          </div>
          <div className='tweets-scroll'>
            {tweets}
          </div>
        </div>
      )
    })

    return containers
  }

  render() {
    return (
      <div className={this.state.darkMode ? 'app dark' : 'app'}>
        <div id='top-buttons'>
          <div id='moon' onClick={this.toggleDarkMode.bind(this)}>
            <img src={'/icons/moon.png'} />
            <span>Dark Mode</span>
          </div>
          {
            Object.keys(this.state.tweets).length === 0 ? null : (
              <div
                id='fullscreen'
                className={this.state.isFullScreen ? 'arrow-down' : 'arrow-up'}
                onClick={this.toggleFullScreen.bind(this)}
              />
            )
          }
        </div>
        <div className={this.state.isFullScreen ? 'collapsed header' : 'header'}>
          <div className='title-wrapper'>
            <h1 className='title'>Stockler</h1>
            <div className='description'>A not-really sophisticated way to get some tweets about the stock market</div>
          </div>

          <div className='input-wrapper'>
            <label>
              <div className='label-text'>Type in the ticker symbol(s)</div>
              <div>
                <input
                  ref='symbolInput'
                  onInput={this.inputIsValid.bind(this)}
                  onKeyDown={this.onInputKeydown.bind(this)}
                  className={this.state.inputIsValid ? '' : 'error'}

                  type='text'
                  placeholder='AAPL, GOOG, TSLA'
                />
                <button id='listen' type='button' onClick={this.listen.bind(this)}>Listen</button>
              </div>
            </label>
          </div>
        </div>
        <div id='tweets'>
          {this.renderTweets()}
        </div>
      </div>
    )
  }
}

export default App
