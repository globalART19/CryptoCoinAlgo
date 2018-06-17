const db = require('../db')
const Sequelize = require('sequelize')
const { sleep } = require('./helperfunctions')
const Gdax = require('gdax')
const publicClient = new Gdax.PublicClient()
const { calculateIndicators } = require('../datamanipulation/historicaldatacalc')


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

const formatData = (data, timeFactor, period = 0, granularity = 0, tf = 0) => {
  const formattedData = data.map((elem, i, data) => {
    // let convertedTime = new Date(0)
    // convertedTime.setUTCSeconds(elem.histTime)
    // return i > data.length - 300 * timeFactor ? [convertedTime, elem.close] : null
    return [elem.histTime, elem.high, elem.low, elem.open, elem.close, elem.volume]
    if (tf) {
      // return [elem.histTime, elem.high, elem.low, elem.open, elem.close, elem.volume, elem.m12ema, elem.m26ema, elem.macd, elem.msig, elem.rsi]
    } else {
      return [elem.histTime, elem.close, elem.m12ema, elem.m26ema, elem.macd, elem.msig, elem.rsi]
    }
  }).filter(elem => !!elem)
  if (period && granularity) {
    // data = await calculateIndicators(granularity, period, histDataArray)
    // data.forEach(dataSet => dataSet.unshift(['Time (1 hr intervals)', 'Price($)', 'm12ema', 'm26ema', 'macd', 'msig', 'rsi']))
  } else {
    // formattedData.unshift(['Time (1 hr intervals)', 'Price($)'])
  }
  return formattedData
}

async function logMinMaxArr(data) {
  const maxlow = await HistoricalData.max('low')
  const maxhigh = await HistoricalData.max('high')
  const maxopen = await HistoricalData.max('open')
  const maxclose = await HistoricalData.max('close')
  const maxvolume = await HistoricalData.max('volume')
  const minlow = await HistoricalData.min('low')
  const minhigh = await HistoricalData.min('high')
  const minopen = await HistoricalData.min('open')
  const minclose = await HistoricalData.min('close')
  const minvolume = await HistoricalData.min('volume')
  const m12max = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.NEGATIVE_INFINITY && curItem[6] !== null) {
      return curItem[6]
    }
    return Math.max(prevVal, curItem[6])
  }, Number.NEGATIVE_INFINITY)
  const m12min = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.POSITIVE_INFINITY && curItem[6] !== null) {
      return curItem[6]
    }
    return Math.min(prevVal, curItem[6])
  }, Number.POSITIVE_INFINITY)
  const m26max = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.NEGATIVE_INFINITY && curItem[7] !== null) {
      return curItem[7]
    }
    return Math.max(prevVal, curItem[7])
  }, Number.NEGATIVE_INFINITY)
  const m26min = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.POSITIVE_INFINITY && curItem[7] !== null) {
      return curItem[7]
    }
    return Math.min(prevVal, curItem[7])
  }, Number.POSITIVE_INFINITY)
  const macdmax = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.NEGATIVE_INFINITY && curItem[8] !== null) {
      return curItem[8]
    }
    return Math.max(prevVal, curItem[8])
  }, Number.NEGATIVE_INFINITY)
  const macdmin = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.POSITIVE_INFINITY && curItem[8] !== null) {
      return curItem[8]
    }
    return Math.min(prevVal, curItem[8])
  }, Number.POSITIVE_INFINITY)
  const msigmax = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.NEGATIVE_INFINITY && curItem[9] !== null) {
      return curItem[9]
    }
    return Math.max(prevVal, curItem[9])
  }, Number.NEGATIVE_INFINITY)
  const msigmin = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.POSITIVE_INFINITY && curItem[9] !== null) {
      return curItem[9]
    }
    return Math.min(prevVal, curItem[9])
  }, Number.POSITIVE_INFINITY)
  const rsimax = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.NEGATIVE_INFINITY && curItem[10] !== null) {
      return curItem[10]
    }
    return Math.max(prevVal, curItem[10])
  }, Number.NEGATIVE_INFINITY)
  const rsimin = data.reduce((prevVal, curItem) => {
    if (prevVal === Number.POSITIVE_INFINITY && curItem[10] !== null) {
      return curItem[10]
    }
    return Math.min(prevVal, curItem[10])
  }, Number.POSITIVE_INFINITY)
  console.log('Min: ', [minlow, minhigh, minopen, minclose, minvolume, m12min, m26min, macdmin, msigmin, rsimin])
  console.log('Max: ', [maxlow, maxhigh, maxopen, maxclose, maxvolume, m12max, m26max, macdmax, msigmax, rsimax])
  return {
    min: [maxlow, maxhigh, maxopen, maxclose, maxvolume, m12max, m26max, macdmax, msigmax, rsimax],
    max: [minlow, minhigh, minopen, minclose, minvolume, m12min, m26min, macdmin, msigmin, rsimin]
  }
}

HistoricalData.findDataSets = async function (start = 0, end = 9999999999) {
  const data = await HistoricalData.findAll({
    // attributes: ['histTime', 'close'],
    // where: {
    //   histTime: {
    //     $between: [start - 1, end + 1]
    //   }
    // },
    order: [['histTime', 'ASC']]
  })
  const histData = data.map(item => item.dataValues)
  const histDataArray = formatData(histData, 1)
  const chart1MinData = formatData(data, 1)
  const chart1HrData = formatData(data, 1)
  const chart1DayData = formatData(data, 24)
  const chart1WkData = formatData(data, 168)

  const tfData = await calculateIndicators(60, 3600, histDataArray)

  const minMax = await logMinMaxArr(histDataArray)

  return {
    chart1MinData,
    chart1HrData,
    chart1DayData,
    chart1WkData,
    tfData,
    minMax
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
      const filledDataArray = []
      dataArray.forEach((elem, i, histDataArray) => {
        if (histDataArray[i - 1]) {
          let curTime = histDataArray[i - 1][0]
          if (Math.round((elem[0] - curTime) / granularity) > 1) {
            console.log(elem[0] - curTime, Math.round((elem[0] - curTime) / granularity))
            count2 += Math.round((elem[0] - curTime) / granularity) - 1
            while (Math.round((elem[0] - curTime) / granularity) > 1) {
              count++ //=================================================testing
              console.log('missed data point # ', count) //============testing
              let repeatItem = [curTime, ...histDataArray[i - 1].slice(1)]
              filledDataArray.push(repeatItem)
              curTime += granularity
            }
          }
        }
        filledDataArray.push(elem)
      })
      const objectifiedArray = filledDataArray.map(elem => {
        return {
          histTime: elem[0],
          low: elem[1],
          high: elem[2],
          open: elem[3],
          close: elem[4],
          volume: elem[5],
        }
      })
      await HistoricalData.bulkCreate(objectifiedArray)
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
