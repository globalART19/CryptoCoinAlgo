const db = require("../db");
const Sequelize = require("sequelize");
const { sleep } = require("./helperfunctions");
const Gdax = require("gdax");
const publicClient = new Gdax.PublicClient();
const { HistoricalData } = require("./historicaldata");
const indicators = require("../datamanipulation/indicatorcalcs");

const TensorFlow = db.define("tensorflow", {
  histTime: {
    type: Sequelize.INTEGER,
    allowNull: false,
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
  m12ema: Sequelize.FLOAT,
  m26ema: Sequelize.FLOAT,
  macd: Sequelize.FLOAT,
  msig: Sequelize.FLOAT,
  rsi: Sequelize.FLOAT
});

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

TensorFlow.findDataSets = async function (start = 0, end = 9999999999) {
  const data = await TensorFlow.findAll({
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

const calcData = (item, i, histDataArray, dataPointsPerPeriod) => {
  let m12ema = null;
  let m26ema = null;
  let macd = null;
  let msig = null;
  let rsi = null;
  if (i > 12 * dataPointsPerPeriod) {
    m12ema = indicators.m12ema(histDataArray, i, dataPointsPerPeriod);
  }
  if (i > 26 * dataPointsPerPeriod) {
    m26ema = indicators.m26ema(histDataArray, i, dataPointsPerPeriod);
    macd = m12ema - m26ema;
  }
  if (i > 44 * dataPointsPerPeriod) {
    msig = indicators.msig(histDataArray, i, macd, dataPointsPerPeriod);
  }
  if (i > 15 * dataPointsPerPeriod) {
    rsi = indicators.rsi(histDataArray, i, dataPointsPerPeriod);
  }
  return {
    histTime: item[0],
    low: item[2],
    high: item[3],
    open: item[4],
    close: item[1],
    volume: item[5],
    m12ema,
    m26ema,
    macd,
    msig,
    rsi
  };
}

TensorFlow.populateData = async function (granularity, period, curHistData) {
  const newData = await HistoricalData.findAll({
    order: [["histTime", "ASC"]]
  });
  const histData = newData.map(item => {
    return [
      item.dataValues.histTime,
      item.dataValues.close,
      item.dataValues.low,
      item.dataValues.high,
      item.dataValues.open,
      item.dataValues.volume
    ];
  });
  const dataPointsPerPeriod = Math.floor(period / granularity) > 0 ?
    Math.floor(period / granularity) : 1
  const sortedHistData = histData.sort((a, b) => a[0] - b[0])
  let count = 0 //=============================================================testing
  let count2 = 0 //=============================================================testing
  await Promise.all(sortedHistData.forEach(async (item, i, histDataArray) => {
    let objData
    // Use previous data point to fill any missing data
    if (histData[i - 1]) {
      let curTime = histDataArray[i - 1][0]
      if (Math.round((item[0] - curTime) / granularity) > 1) {
        console.log(item[0] - curTime, Math.round((item[0] - curTime) / granularity))
        count2 += Math.round((item[0] - curTime) / granularity) - 1
        while (Math.round((item[0] - curTime) / granularity) > 1) {
          count++ //=================================================testing
          console.log('missed data point # ', count) //============testing
          let repeatItem = [curTime, ...histDataArray[i - 1].slice(1)]
          objData = calcData(item, i, histDataArray, dataPointsPerPeriod)
          await TensorFlow.create(objData)
          curTime += granularity
        }
      }
    }
    objData = calcData(item, i, histDataArray, dataPointsPerPeriod)
    await TensorFlow.create(objData)
  }))
  console.log('count', count, 'count2', count2)
  console.log("tensorflow data populated");
};

module.exports = { TensorFlow };
