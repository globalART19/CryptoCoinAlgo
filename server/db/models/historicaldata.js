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
  const bulkUpdateArray = []
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
      bulkUpdateArray.push([...dataArray])
      startSetTime = endSetTime + granMS
      endSetTime += 300 * granMS
      count++
    }
  } catch (e) {
    console.error('Invalid importHistory (probably date format)', e)
  }
  try {
    const flatBulkUpdateArray = [].concat.apply([], bulkUpdateArray)
    const objectifiedArray = flatBulkUpdateArray.map(elem => {
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
    console.log('historical data import successful')
  } catch (e) {
    console.error('Failed db push', e)
  }
}

module.exports = { HistoricalData }
