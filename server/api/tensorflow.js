const router = require('express').Router()
const { HistoricalData } = require('../db/models')
const { calculateIndicators } = require('../db/datamanipulation/historicaldatacalc')

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
    const eDate = new Date(2018, 5, 10, 0, 0, 0)
    await HistoricalData.importHistory('BTC-USD', sDate, eDate, 60)
    res.sendStatus(201)
  } catch (e) {
    next(e)
  }
})

router.post('/chart', async (req, res, next) => {
  try {
    const tfData = await TensorFlow.findAll({ attributes: ['histTime', 'close'], order: [['histTime', 'ASC']] })
    const tfDataArr = tfData.map((instance) => {
      return [instance.dataValues.histTime, instance.dataValues.close, instance.dataValues.]
    })
    let chartData
    if (req.body.period) {
      chartData = await calculateIndicators(req.body.granularity, req.body.period, histDataArray)
      chartData.unshift(['Time (1 hr intervals)', 'Price($)', 'm12ema', 'm26ema', 'macd', 'msig', 'rsi'])
    } else {
      chartData.unshift(['Time (1 hr intervals)', 'Price($)'])
    }
    const chart1MinData = chartData.map((elem, i) => {
      return i < 501 ? elem : null
    }).filter(elem => !!elem)
    const chart1HrData = chartData.map((elem, i) => {
      return i < 501 ? elem : null
    }).filter(elem => !!elem)
    const chart1DayData = chartData.map((elem, i) => {
      if (i < 501 * 24 && i % 24 === 0) return elem
    }).filter(elem => !!elem)
    const chart1WkData = chartData.map((elem, i) => {
      if (i < 501 * 168 && i % 168 === 0) return elem
    }).filter(elem => !!elem)
    const responseData = {
      chart1MinData,
      chart1HrData,
      chart1DayData,
      chart1WkData
    }
    res.json(JSON.stringify(responseData))
  } catch (e) {
    next(e)
  }
})

module.exports = router
