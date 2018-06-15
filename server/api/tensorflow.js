const router = require('express').Router()
const { TensorFlow } = require('../db/models')
const { calculateIndicators } = require('../db/datamanipulation/historicaldatacalc')

// router.get('/', async (req, res, next) => {
//   try {
//     const historicalData = await HistoricalData.findDataSets(req.body.start, req.body.end)
//     res.json(historicalData)
//   } catch (e) {
//     next(e)
//   }
// })

// router.post('/', async (req, res, next) => {
//   try {
//     const sDate = new Date(2017, 4, 1, 0, 0, 0)
//     const eDate = new Date(2018, 5, 10, 0, 0, 0)
//     await HistoricalData.importHistory('BTC-USD', sDate, eDate, 60)
//     res.sendStatus(201)
//   } catch (e) {
//     next(e)
//   }
// })

router.get('/', async (req, res, next) => {
  try {
    const tfData = await TensorFlow.findAll({ order: [['histTime', 'ASC']] })
    const chartData = tfData.map((instance) => {
      return [instance.dataValues.histTime, instance.dataValues.close, instance.dataValues.m12ema, instance.dataValues.m26ema, instance.dataValues.macd, instance.dataValues.msig, instance.dataValues.rsi]
    })
    chartData.unshift(['Time (1 hr intervals)', 'Price($)', 'm12ema', 'm26ema', 'macd', 'msig', 'rsi'])

    const chart1MinData = chartData.map((elem, i) => {
      return i < 501 * 60 && i % 60 === 0 ? elem : null
    }).filter(elem => !!elem)
    const chart1HrData = chartData.map((elem, i) => {
      return i < 501 * 60 && i % 60 === 0 ? elem : null
    }).filter(elem => !!elem)
    const chart1DayData = chartData.map((elem, i) => {
      if (i < 501 * 24 * 60 && i % 24 * 60 === 0) return elem
    }).filter(elem => !!elem)
    const chart1WkData = chartData.map((elem, i) => {
      if (i < 501 * 168 * 60 && i % 168 * 60 === 0) return elem
    }).filter(elem => !!elem)
    const responseData = {
      chart1MinData,
      chart1HrData,
      chart1DayData,
      chart1WkData,
      chartData
    }
    res.json(responseData)
  } catch (e) {
    next(e)
  }
})

module.exports = router
