const router = require('express').Router()
module.exports = router

router.use('/users', require('./users'))
router.use('/historicaldata', require('./historicaldata'))
router.use('/tensorflow', require('./tensorflow'))

router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
