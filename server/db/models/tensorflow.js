const db = require('../db')
const Sequelize = require('sequelize')
const { sleep } = require('./helperfunctions')
const Gdax = require('gdax')
const publicClient = new Gdax.PublicClient()
const { HistoricalData } = require('./historicaldata')
const indicators = require('../datamanipulation/indicatorcalcs')

const TensorFlow = db.define('tensorflow', {
  low: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  high: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  open: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  close: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  volume: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  m12ema: Sequelize.FLOAT,
  m26ema: Sequelize.FLOAT,
  macd: Sequelize.FLOAT,
  msig: Sequelize.FLOAT,
  rsi: Sequelize.FLOAT,
})

const formatData = (data, timeFactor, period = 0, granularity = 0) => {
  const formattedData = data.map((elem, i, data) => {
    // let convertedTime = new Date(0)
    // convertedTime.setUTCSeconds(elem.histTime)
    // return i > data.length - 300 * timeFactor ? [convertedTime, elem.close] : null
    return [elem.histTime, elem.close]
  }).filter(elem => !!elem)
  if (period && granularity) {
    // data = await calculateIndicators(granularity, period, histDataArray)
    // data.forEach(dataSet => dataSet.unshift(['Time (1 hr intervals)', 'Price($)', 'm12ema', 'm26ema', 'macd', 'msig', 'rsi']))
  } else {
    // formattedData.unshift(['Time (1 hr intervals)', 'Price($)'])
  }
  return formattedData
}

TensorFlow.populateData = async function (granularity, period, curHistData) {
  const newData = await HistoricalData.findAll({ order: [['histTime', 'ASC']] })
  const histData = newData.map((item) => { return [item.dataValues.histTime, item.dataValues.close, item.dataValues.low, item.dataValues.high, item.dataValues.open, item.dataValues.volume] })
  const dataPointsPerPeriod = Math.floor(period / granularity) > 0 ? Math.floor(period / granularity) : 1
  const sortedHistData = histData.sort((a, b) => a[0] - b[0])
  sortedHistData.forEach((item, i, histDataArray) => {
    if (histDataArray[i - 1] && item[0] === histDataArray[i - 1][0]) {
      return histDataArray[i - 1][0]
    }
    let m12ema = null
    let m26ema = null
    let macd = null
    let msig = null
    let rsi = null
    if (i > 12 * dataPointsPerPeriod) {
      m12ema = indicators.m12ema(histDataArray, i, dataPointsPerPeriod)
    }
    if (i > 26 * dataPointsPerPeriod) {
      m26ema = indicators.m26ema(histDataArray, i, dataPointsPerPeriod)
      macd = m12ema - m26ema
    }
    if (i > 44 * dataPointsPerPeriod) {
      msig = indicators.msig(histDataArray, i, macd, dataPointsPerPeriod)
    }
    if (i > 15 * dataPointsPerPeriod) {
      rsi = indicators.rsi(histDataArray, i, dataPointsPerPeriod)
    }
    item.push(m12ema, m26ema, macd, msig, rsi)
  })
  const objData = sortedHistData.map(data => {
    return {
      histTime: data[0],
      low: data[2],
      high: data[3],
      open: data[4],
      close: data[1],
      volume: data[5],
      m12ema: data[6],
      m26ema: data[7],
      macd: data[8],
      msig: data[9],
      rsi: data[10],
    }
  })
  TensorFlow.bulkCreate(objData)
}

module.exports = { TensorFlow }
