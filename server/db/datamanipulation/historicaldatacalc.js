const indicators = require('./indicatorcalcs')
const { HistoricalData } = require('../db')

const calculateIndicators = async function (granularity, period, curHistData) {
  let histData
  if (!curHistData) {
    const newData = await HistoricalData.findAll({ attributes: ['histTime', 'close'], order: ['histTime', 'ASC'] })
    histData = newData.map((item) => { return [item.dataValues.histTime, item.dataValues.close] })
  } else {
    histData = curHistData.map((item) => { return [item[0], item[1]] })
  }
  const dataPointsPerPeriod = Math.floor(period / granularity) > 0 ? Math.floor(period / granularity) : 1
  const sortedHistData = histData.sort((a, b) => a[0] - b[0])
  sortedHistData.forEach((item, i, histDataArray) => {
    let m12ema = null
    let m26ema = null
    let mave = null
    let msig = null
    let rsi = null
    if (i > 12 * dataPointsPerPeriod) {
      m12ema = indicators.m12ema(histDataArray, i, dataPointsPerPeriod)
    }
    if (i > 26 * dataPointsPerPeriod) {
      m26ema = indicators.m26ema(histDataArray, i, dataPointsPerPeriod)
      mave = m12ema - m26ema
    }
    if (i > 44 * dataPointsPerPeriod) {
      msig = indicators.msig(histDataArray, i, mave, dataPointsPerPeriod)
    }
    if (i > 15 * dataPointsPerPeriod) {
      rsi = indicators.rsi(histDataArray, i, dataPointsPerPeriod)
    }
    item.push(m12ema, m26ema, mave, msig, rsi)
  })
  return sortedHistData
}

module.exports = { calculateIndicators }