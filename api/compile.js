const fs = require('fs-extra')
const pf = require('portfinder')
const fileDB = require('../db/file-quiries')
const { spawn } = require('child_process')

module.exports.createConfigFile = username => {
  return pf.getPortPromise()
    .then(port => {
      module.exports.port = port
      const filename = `tmp/nickwu_config`
      const data = `port=${port}\n`
      return fs.outputFile(filename, data)
    }).catch(err => {
      console.log(err)
      throw err
    })
}

module.exports.createSourceFile = (username) => {
  fileDB.getFileForUser(user)
}

module.exports.compileLinksFile = function (req, res, next) {
  if (!req.session.user) {
    res.status(401)
      .json({
        status: 'error',
        message: 'No authentication. Make sure you have logged in'
      })
    return
  }

  const username = req.session.user.username
  this.createConfigFile(username)
    .then(() => {
      var linxProc = spawn(`linx --config=/tmp/${username}_conig /tmp/${username}_source.links`)

      linxProc.stderr.on('data', (data) => {
        console.log(data)
        linxProc.kill()
        res.status(500).json({
          status: 'compile error',
          message: data
        })
      })

      res.status(200).json({
        status: 'compiled and deployed',
        port: module.exports.port
      })
    })
    .catch(error => {
      console.log(error)
      res.status(500)
        .json({
          status: 'error',
          detail: error
        })
    })
}