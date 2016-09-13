
const express = require('express')

const router = express.Router()

const {
  readFile
} = require('sacred-fs')

/*
 * DraftJS has a dependency on UA Parser which has a dependency on 'window'
 */
// global.window = global

router.get('/v1/read-me', (req, res) => {
  readFile('README.md', 'utf8')
    .then((md) => {
      res.json({ md })
    })
    .catch((e) => {
      res.send(e)
    })
})

module.exports = router
