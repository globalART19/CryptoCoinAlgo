const db = require('../db')
const Sequelize = require('sequelize')
const { calcAlgoReturn } = require('../datamanipulation/algorithm')
const { HistoricalData } = require('./historicaldata')

const AlgorithmResults = db.define('algorithmresults', {
  maxReturn: Sequelize.BIGINT,
  algoReturn: Sequelize.BIGINT
})

AlgorithmResults.calcReturns = async function () {
  console.log('calcResults start')
  const maxReturn = await AlgorithmResults.calcMaxReturn()
  const algoReturn = await calcAlgoReturn()
  console.log('AlgoResults: ', maxReturn, algoReturn)
  // AlgorithmResults.create({ maxReturn, algoReturn })
}

AlgorithmResults.calcMaxReturn = async function () {
  const histData = await HistoricalData.findAll({ attributes: ['histTime', 'close'], order: [['histTime', 'ASC']] })
  // const histData = [1000, 1500, 2000, 1500, 1000, 1500, 2000, 1500, 1000, 1500, 2000]
  let curQty = 0
  let curBank = 1000 / 1000000000000000
  let tick = 0
  let lastBuyPrice = 0
  while (histData[tick + 1]) {
    let curVal = histData[tick].dataValues.close
    let nextVal = histData[tick + 1].dataValues.close
    //buy condition
    if (nextVal > curVal && curQty === 0) {
      lastBuyPrice = curVal
      curQty = curBank / curVal
      curBank = 0
      //set buy marker
    }
    //sell condition
    if (nextVal < curVal && curQty > 0) {
      curBank = curVal * curQty
      console.log(histData[tick].dataValues.histTime, lastBuyPrice, curVal, curBank, curQty)
      curQty = 0
      //set sell marker
    }
    tick++
  }
  const lastVal = histData[histData.length - 1].dataValues.close
  if (curQty > 0) curBank = lastVal * curQty
  console.log('curBank', curBank)
  return Math.floor(curBank)
}

module.exports = { AlgorithmResults }
