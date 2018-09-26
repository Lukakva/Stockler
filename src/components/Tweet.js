import React from 'react'
import '../css/Tweet.css'

const Months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

// adds a leading zero
const lead = str => {
  str = (str || '').toString()
  if (str.length < 2) str = '0' + str

  return str
}

export default class Tweet extends React.Component {
  constructor(props) {
    super(props)

    let tweet = this.props.tweet
    if (tweet.retweeted_status) {
      tweet = tweet.retweeted_status
    }

    this.state = {
      tweet: tweet,
    }
  }

  /* Renders the user information section (picture, name, and @username) */
  renderUser() {
    let user = this.state.tweet.user

    return (
      <a className='tweet-user'>
        <div className='tweet-user-avatar'>
          <img src={user.profile_image_url_https} />
        </div>
        <div className='tweet-user-info'>
          <div className='tweet-user-name'>{user.name}</div>
          <div className='tweet-user-screen-name'>@{user.screen_name}</div>
        </div>
      </a>
    )
  }

  /* Returns a regex that matches an entity */
  entityRegex(entity) {
    let escaped = entity.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return new RegExp('([\\b]?)' + escaped + '([\\b]?)')
  }

  // injects an entity into the indices map
  injectEntity(map, indices, entity, url, replacementText) {
    if (!replacementText) {
      replacementText = entity
    }

    let html = `<a href="${url}" class="tweet-link" target="_blank">${replacementText}</a>`

    let start = indices[0]
    let end = indices[1]

    map[start] = {
      end: end,
      html: html,
    }
  }

  injectUrls(map, urls) {
    urls.map(entity => {
      let url = entity.url

      this.injectEntity(map, entity.indices, url, url, entity.display_url)
    })
  }

  injectHashtags(map, hashtags) {
    hashtags.map(entity => {
      let hashtag = entity.text
      let url = 'https://twitter.com/hashtag/' + hashtag

      this.injectEntity(map, entity.indices, '#' + hashtag, url)
    })
  }

  injectSymbols(map, symbols) {
    symbols.map(entity => {
      let symbol = entity.text
      let url = 'https://twitter.com/search?q=' + encodeURIComponent('$' + symbol)

      this.injectEntity(map, entity.indices, '$' + symbol, url)
    })
  }

  injectUserMentions(map, userMentions) {
    userMentions.map(entity => {
      let user = entity.name
      let url = 'https://twitter.com/' + user

      this.injectEntity(map, entity.indices, '@' + user, url)
    })
  }

  performIndicesMap(indicesMap, text) {
    let result = ''
    let lastIndex = 0
    let i;

    for (i = 0; i < text.length; i++) {
      // check what entity starts at this index
      let index = indicesMap[i]
      if (!index) continue

      // there are some characters between the entity indexes
      if (i > lastIndex) {
        result += text.slice(lastIndex, i)
      }

      result += index.html
      // move the iteration cursor to the end of this entity, there can't be any other entities
      // until the end anyway
      i = index.end - 1
      lastIndex = index.end
    }

    // there's some text after the last index as well
    if (i > lastIndex) {
      result += text.slice(lastIndex, i)
    }

    return result
  }

  /* Renders the tweet text */
  renderText() {
    let tweet = this.state.tweet
    let text = tweet.full_text || tweet.text
    let entities = tweet.entities

    if (tweet.display_text_range instanceof Array) {
      text = text.slice.apply(text, tweet.display_text_range)
    }

    // stores all indices and their replacements
    let indicesMap = {}

    this.injectUrls(indicesMap, entities.urls || [])
    this.injectHashtags(indicesMap, entities.hashtags || [])
    this.injectSymbols(indicesMap, entities.symbols || [])
    this.injectUserMentions(indicesMap, entities.user_mentions || [])

    let html = this.performIndicesMap(indicesMap, text)

    return (
      <div className='tweet-text' dangerouslySetInnerHTML={{__html: html}}></div>
    )
  }

  renderDate() {
    let tweet = this.state.tweet
    let date = new Date(tweet.created_at)

    let hours = lead(date.getHours())
    let minutes = lead(date.getMinutes())
    let cycle = hours < 12 ? 'AM' : 'PM'

    let dateNumber = date.getDate()
    let month = Months[date.getMonth()]
    let year = date.getFullYear()

    let dateString = `${hours}:${minutes} ${cycle} - ${month} ${dateNumber}, ${year}`

    return (
      <div className='tweet-time'>
        {dateString}
      </div>
    )
  }

  // renders favorites count and
  renderMisc() {
    let tweet = this.state.tweet
    let user = tweet.user
    let favoriteCount = tweet.favorite_count
    let userLink = `See ${user.name}'s other Tweets`

    return (
      <div className='tweet-misc'>
        <div className='favorites'>
          <span className='icon'></span>
          <span className='count'>{favoriteCount}</span>
        </div>
        <div className='profile'>
          <span className='icon'></span>
          <span className='name'>{userLink}</span>
        </div>
      </div>
    )
  }

  getSelection() {
    let text = ''

    if (window.getSelection) {
      text = window.getSelection()
    } else if (document.getSelection) {
      text = document.getSelection()
    } else if (document.selection) {
      text = document.selection.createRange().text
    }

    return text.toString()
  }

  onClick() {
    // if user selected some text on the tweet, don't open a new tab
    let selection = this.getSelection()
    if (selection.length > 0) return

    let url = 'https://twitter.com/i/web/status/' + this.state.tweet.id_str
    window.open(url, '_blank')
  }

  render() {
    let theme = this.props.theme || 'light'

    return (
      <div className={'tweet ' + theme} onClick={this.onClick.bind(this)}>
        {this.renderUser()}
        <div className='tweet-body'>
          {this.renderText()}
          {this.renderDate()}
          {this.renderMisc()}
        </div>
      </div>
    )
  }
}
