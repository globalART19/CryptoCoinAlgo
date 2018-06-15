const db = require('../db')
const Sequelize = require('sequelize')
const { sleep } = require('./helperfunctions')
const Gdax = require('gdax')
const publicClient = new Gdax.PublicClient()

const HistoricalData = db.define('historicaldata', {
  histTime: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
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
})

const formatData = (data, timeFactor, period = 0, granularity = 0) => {
  const formattedData = data.map((elem, i, data) => {
    // let convertedTime = new Date(0)
    // convertedTime.setUTCSeconds(elem.histTime)
    // return i > data.length - 300 * timeFactor ? [convertedTime, elem.close] : null
    return [elem.histTime, elem.close, elem.m12ema, elem.m26ema, elem.macd, elem.msig, elem.rsi]
  }).filter(elem => !!elem)
  if (period && granularity) {
    // data = await calculateIndicators(granularity, period, histDataArray)
    // data.forEach(dataSet => dataSet.unshift(['Time (1 hr intervals)', 'Price($)', 'm12ema', 'm26ema', 'macd', 'msig', 'rsi']))
  } else {
    // formattedData.unshift(['Time (1 hr intervals)', 'Price($)'])
  }
  return formattedData
}

HistoricalData.findDataSets = async function (start = 0, end = 9999999999) {
  const data = await HistoricalData.findAll({
    attributes: ['histTime', 'close'],
    where: {
      histTime: {
        $between: [start - 1, end + 1]
      }
    },
    order: [['histTime', 'ASC']]
  })
  const chart1MinData = formatData(data, 1)
  const chart1HrData = formatData(data, 1)
  const chart1DayData = formatData(data, 24)
  const chart1WkData = formatData(data, 168)

  return {
    chart1MinData,
    chart1HrData,
    chart1DayData,
    chart1WkData
  }
}

const getHistoricalAPIData = async (product, startSetTime, endSetTime, granularity) => {
  let startISOTime = new Date(startSetTime).toISOString().replace('Z', '000Z')
  let endISOTime = new Date(endSetTime).toISOString().replace('Z', '000Z')
  let dataArray = publicClient.getProductHistoricRates(
    product,
    {
      start: startISOTime,
      end: endISOTime,
      granularity: granularity,
    })
  return dataArray
}

HistoricalData.importHistory = async function (product, startDate, endDate, granularity, period, forceUpdate = false) {
  try {
    if (![60, 300, 900, 3600, 21600, 86400].includes(granularity)) { throw new Error('Bad granularity') }
    let startSetTime = startDate.getTime()
    let endSetTime = endDate.getTime()
    const granMS = granularity * 1000
    if ((endDate.getTime() - startDate.getTime()) / granMS > 300) {
      endSetTime = startSetTime + 299 * granMS
    }
    let count = 0
    while (endSetTime <= endDate.getTime() || count === 0) {
      let dataArray = await getHistoricalAPIData(product, startSetTime, endSetTime, granularity)
      await sleep(500)
      const objectifiedArray = dataArray.map(elem => {
        return {
          histTime: elem[0],
          low: elem[1],
          high: elem[2],
          open: elem[3],
          close: elem[4],
          volume: elem[5],
        }
      })
      HistoricalData.bulkCreate(objectifiedArray)
      startSetTime = endSetTime + granMS
      endSetTime += 300 * granMS
      console.log('pull attempt # ', count)
      count++
    }
  } catch (e) {
    console.error('Invalid importHistory (probably date format)', e)
  }
  try {
    // const flatBulkUpdateArray = [].concat.apply([], bulkUpdateArray)
    // const objectifiedArray = flatBulkUpdateArray.map(elem => {
    //   return {
    //     histTime: elem[0],
    //     low: elem[1],
    //     high: elem[2],
    //     open: elem[3],
    //     close: elem[4],
    //     volume: elem[5],
    //   }
    // })
    // await HistoricalData.bulkCreate(objectifiedArray)
    console.log('historical data import successful')
  } catch (e) {
    console.error('Failed db push', e)
  }
}

module.exports = { HistoricalData }
