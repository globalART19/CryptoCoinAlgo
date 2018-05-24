//Indicator calculations

const m12ema = function (histData, index, period) {
  let firstSum = 0
  const startPoint = index - 12 * period
  for (let i = startPoint; i < startPoint + period; i++) {
    firstSum += histData[i][1]
  }
  let curSum = 0
  for (let i = startPoint + period; i < index; i++) {
    curSum += histData[i][1]
  }
  const m12emaCalc = firstSum * 2 / (13 * period) + curSum / (13 * period)
  return m12emaCalc
}

const m26ema = function (histData, index, period) {
  let firstSum = 0
  const startPoint = index - 26 * period
  for (let i = startPoint; i < startPoint + period; i++) {
    firstSum += histData[i][1]
  }
  let curSum = 0
  for (let i = startPoint + period; i < index; i++) {
    curSum += histData[i][1]
  }
  const m26emaCalc = firstSum * 2 / (27 * period) + curSum / (27 * period)
  return m26emaCalc
}

const msig = function (histData, index, curMave, period) {
  let msigcalc = 0
  let firstSum = curMave
  let curSum = 0
  const startPoint = index - 44 * period
  for (let i = startPoint; i < startPoint + period; i++) {
    firstSum += histData[i][4]
  }
  for (let i = startPoint + period; i < startPoint + 9 * period; i++) {
    curSum += histData[i][4]
  }
  msigcalc = (firstSum * 2 / (10 * period)) + (curSum * 8 / (10 * period))
  return msigcalc
}

const rsi = function (histData, index, period) {
  let gain = 0, numGain = 0, loss = 0, numLoss = 0, curPrice = 0, lastPrice = 0, deltaValue = 0
  const startPoint = index - 15 * period
  curPrice = histData[startPoint][1]
  for (let i = startPoint + 1; i < index; i++) {
    lastPrice = curPrice
    curPrice = histData[i][1]
    deltaValue = curPrice - lastPrice
    if (deltaValue >= 0) {
      gain += deltaValue
      numGain += 1
    } else {
      loss += deltaValue
      numLoss += 1
    }
  }
  if (numGain === 0) return 0
  if (numLoss === 0) return 100
  return 100 - 100 / (1 + (gain / numGain) / (Math.abs(loss) / numLoss))
}

module.exports = { m12ema, m26ema, msig, rsi }