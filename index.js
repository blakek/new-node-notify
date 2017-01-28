const axios = require('axios')
const fs = require('fs')
const pify = require('pify')

const readFile = pify(fs.readFile)
const url = 'https://nodejs.org/dist/index.json'

axios.get(url)
  .then(({ data }) => data.map(versionInfo => versionInfo.version))
  .then(versions => ({ version: versions[0] }))
  .then(latestVersion => {
    getPreviousLatest()
      .then(previousLatest => {
        if (latestVersion.version !== previousLatest.version) {
          fs.writeFileSync('previousLatest.json', JSON.stringify(latestVersion))
          pbNotify(
            `Node.js ${latestVersion.version}...`,
            `Node.js ${latestVersion.version} is now available!`
          )
        }
      })
  })
  .catch(err => console.error(err))

function getPreviousLatest () {
  return readFile('previousLatest.json', 'utf8')
    .then(contents => JSON.parse(contents))
    .then(latestVersion => ({ version: latestVersion.version }))
    .catch(() => ({ version: 0 }))
}

function pbNotify (title, body) {
  const data = {
    type: 'note',
    title: title,
    body: body
  }

  const config = {
    auth: { username: process.env.PUSHBULLET_TOKEN }
  }

  axios.post('https://api.pushbullet.com/v2/pushes', data, config)
}
