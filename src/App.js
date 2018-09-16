import React from 'react'
import logo from './logo.svg'
import './App.css'

import Twitter from './Twitter'

const error = console.log
const success = console.log

class App extends React.Component {
  constructor(props) {
    super(props)

    this.twitter = new Twitter()

    this.state = {
      symbols: [],
      inputIsValid: true,
    }
  }

  addSymbol(symbol) {
    let symbols = this.state.symbols.slice()
    symbols.push(symbol)

    this.setState({
      symbols: symbols,
    })
  }

  removeSymbol(symbol) {
    // Copy the array
    let symbols = this.state.symbols.slice()
    let index = symbols.indexOf(symbol)

    if (index > -1) {
      symbols.splice(index, 1)

      this.setState({
        symbols: symbols,
      })
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

  listen() {
    let symbol = this.refs.symbolInput.value
    if (!symbol.length) {
      return this.inputIsInvalid()
    }

    this.twitter.getSearch({'q': symbol,'count': 10}, error, success);
  }

  render() {
    return (
      <div className='app'>
        <h1 className='title'>Stockler</h1>
        <div className='description'>A not-really sophisticated way to get some tweets about the stock market</div>
        <div className='input-wrapper'>
          <label>
            <div>Type in the ticker symbol:</div>
            <div>
              <input
                ref='symbolInput'
                onInput={this.inputIsValid.bind(this)}
                className={this.state.inputIsValid ? '' : 'error'}

                type='text'
                placeholder='Ex: AAPL'
              />
              <button id='listen' type='button' onClick={this.listen.bind(this)}>Listen</button>
            </div>
          </label>
        </div>
      </div>
    )
  }
}

export default App
