const router = require('express').Router()
const { db, HistoricalData } = require('../db/')
const { calculateIndicators } = require('../datamanipulation/historicaldatacalc')

router.get('/', async (req, res, next) => {
  try {
    const historicalData = await HistoricalData.findDataSets(req.body.start, req.body.end)
    res.json(historicalData)
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const sDate = new Date(2017, 4, 1, 0, 0, 0)
    const eDate = new Date(2018, 4, 2, 0, 0, 0)
    await HistoricalData.importHistory('BTC-USD', sDate, eDate, req.body.period)
    res.sendStatus(201)
  } catch (e) {
    next(e)
  }
})

router.post('/chart', async (req, res, next) => {
  try {
    const histData = await HistoricalData.findAll({ attributes: ['histTime', 'close'], order: [['histTime', 'ASC']] })
    const histDataArray = histData.map((instance) => {
      return [instance.dataValues.histTime, instance.dataValues.close]
    })
    if (req.body.period) {
      const chartData = await calculateIndicators(req.body.granularity, req.body.period, histDataArray)
      chartData.unshift(['Time (1 hr intervals)', 'Price($)', 'm12ema', 'm26ema', 'mave', 'msig', 'rsi'])
      res.json(JSON.stringify(chartData))

    } else {
      histDataArray.unshift(['Time (1 hr intervals)', 'Price($)'])
      res.json(JSON.stringify(histDataArray))
    }
  } catch (e) {
    next(e)
  }
})

module.exports = router
