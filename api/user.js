var userDB = require('../db/user-quiries')
var bcrypt = require('bcryptjs')

function signup (req, res, next) {
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password

  // Check if username is used.
  userDB.getUserByUsername(username)
    .then(() => {
      res.status(409)
        .json({
          status: 'error',
          message: 'Username used'
        })
    })
    .catch(() => {
      // Hashing
      const salt = bcrypt.genSaltSync()
      const hash = bcrypt.hashSync(password, salt)

      userDB.createUser(username, email, hash)
        .then(() => {
          res.status(200)
            .json({
              status: 'success',
              message: `User ${username} registered`
            })
        })
        .catch(err => {
          res.status(500)
            .json(err)
        })
    })
}

function login (req, res, next) {
  const username = req.body.username
  const password = req.body.password

  // Check if user exists.
  userDB.getUserByUsername(username)
    .then((user) => {
      if (bcrypt.compareSync(password, user.password)) {
        req.session.user = user
        res.status(200)
          .json({
            status: 'success',
            message: 'Login successful'
          })
      } else {
        res.status(401)
          .json({
            status: 'error',
            message: 'Incorrect login or password'
          })
      }
    }).catch(() => {
      res.status(404)
        .json({
          status: 'error',
          message: 'Username not found'
        })
    })
}

function update (req, res, next) {
  if (!req.session.user) {
    res.status(401)
      .json({
        status: 'error',
        message: 'No authentication. Make sure you have logged in'
      })
    return
  }

  const username = req.body.username
  // Check if user exists.
  userDB.getUserByUsername(username)
    .then((user) => {
      const email = req.body.email
      const password = req.body.password
      const lastTutorial = req.body.last_tutorial
      const salt = bcrypt.genSaltSync()
      const hash = password === undefined ? undefined : bcrypt.hashSync(password, salt)
      userDB.updateUser(username, { email: email, password: hash, last_tutorial: lastTutorial })
        .then(() => {
          res.status(200)
            .json({
              status: 'success',
              message: 'User updated'
            })
        })
        .catch(() => {
          res.status(500)
            .json({
              status: 'error',
              message: 'User failed to update'
            })
        })
    }).catch(() => {
      res.status(404)
        .json({
          status: 'error',
          message: 'Username not found'
        })
    })
}

module.exports = {
  signup: signup,
  login: login,
  update: update
}
