// Load the binding:
// require("@tensorflow/tfjs-node"); // Use '@tensorflow/tfjs-node-gpu' if running with GPU.
// const tf = require("@tensorflow/tfjs");
// import * as tf from '@tensorflow/tfjs'

///pulled from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(xArr, yArr) {
  let counter = xArr.length;
  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);
    counter--;
    let xTemp = xArr[counter];
    xArr[counter] = xArr[index];
    xArr[index] = xTemp;
    let yTemp = yArr[counter];
    yArr[counter] = yArr[index];
    yArr[index] = yTemp;
  }
  return [xArr, yArr];
}

export async function runTfModel(rawData, min, max) {
  // NN Constants
  const numInputs = 5
  const numNeurons = 256
  const batchSize = 128
  const epochs = 10
  const trainTestRatio = .8
  const learningRate = 0.1

  const lstmSize = 100
  const n_steps = 45
  const seq_width = 50


  // const rawData = await HistoricalData.findAll({ order: ['histTime', 'ASC'] })

  const batchedXData = []
  let batchXArr = []
  const batchedYData = []
  let batchYArr = []
  rawData.forEach(elem => {
    //scaling
    const scaled = elem.map((item, i) => {
      if (i > 0) {
        return (elem[i] - min[i - 1]) / (max[i - 1] - min[i - 1])
      }
    })
    batchXArr.push(scaled.slice(1))
    batchYArr.push([scaled[3]])
    if (batchXArr.length >= batchSize) {
      batchedXData.push(batchXArr)
      batchXArr = []
      batchedYData.push(batchYArr)
      batchYArr = []
    }
  })
  console.log('batched data length', batchedXData.length)

  const trainTestSlice = Math.round(batchedXData.length * trainTestRatio)

  const trainXData = batchedXData.slice(0, trainTestSlice)
  const testXData = batchedXData.slice(trainTestSlice)
  const trainYData = batchedYData.slice(0, trainTestSlice)
  const testYData = batchedYData.slice(trainTestSlice)

  const model = tf.sequential()

  // const configHidden = {
  //   units: 4,
  //   inputShape: [numInputs, batchSize],
  //   activation: 'relu',
  // }
  // const configOutput = {
  //   units: 2,
  //   activation: 'relu'
  // }

  // tf.layers.dense() => fully connected layer
  const hidden = tf.layers.dense({
    units: numNeurons,
    inputShape: [numInputs],
    activation: 'relu',
  })
  const output = tf.layers.dense({
    units: 1,
    activation: 'relu'
  })

  model.add(hidden)
  model.add(output)

  const sgdOptimizer = tf.train.sgd(learningRate)

  // const configCompile = {
  //   optimizer: sgdOptimizer,
  //   loss: 'meanSquaredError'
  // }

  console.log('pre-compile')
  model.compile({
    optimizer: sgdOptimizer,
    loss: 'meanSquaredError'
  })
  console.log('post-compile')

  console.log('train data length', trainXData.length)
  const trainDataXs = trainXData.slice(0, trainXData.length - 1)
  const trainDataYs = trainYData.slice(1)
  console.log('pre-for loop', trainDataXs.length)
  for (let i = 0; i < trainDataXs.length - 1; i++) {
    const xs = tf.tensor2d(trainDataXs[i]) //inputs
    const ys = tf.tensor2d(trainDataYs[i]) //expected outputs
    const configFit = {
      batchSize: batchSize,
      epochs: epochs
    }
    const response = await model.fit(xs, ys, configFit)
    const loss = response.history.loss[0]
    console.log('Rd:', i, '  Train Loss:', loss)
  }

  console.log('!!!!!!Test Data Results!!!!!!')
  let avgTestLoss = 0
  let lossSum = 0

  console.log('test data length', testXData.length)
  const testDataXs = testXData.slice(0, testXData.length - 1)
  const testDataYs = testYData.slice(1)
  console.log('X data', testDataXs)
  console.log('Y data', testDataYs)
  let yActual = []
  let yResults = []
  for (let i = 0; i < testDataXs.length - 1; i++) {
    const xs = tf.tensor2d(testDataXs[i]) //inputs
    const ys = tf.tensor2d(testDataYs[i]) //expected outputs
    const configFit = {
      batchSize: batchSize,
      epochs: 1
    }

    tf.tidy(() => {
      const preds = model.predict(xs)
      const y_vals = preds.dataSync()
      testDataYs[i].forEach(elem => {
        yActual.push(elem[0])
      })
      y_vals.forEach(elem => {
        yResults.push(elem)
      })
    })
    const response = await model.fit(xs, ys, configFit)
    const loss = response.history.loss[0]
    lossSum += loss
    avgTestLoss = lossSum / (i + 1)
    console.log('Rd:', i, '  Test Loss:', loss)
  }
  // console.log(yActual)
  // console.log(yResults)
  const fullResults = yActual.map((item, j) => {
    return [item, yResults[j]]
  })
  console.log(fullResults)
  console.log('Final Loss: ', avgTestLoss)
  if (confirm('Save model?')) {
    console.log('saving...')
    const settingsName = `loss_${avgTestLoss}_${numInputs}_${numNeurons}_${batchSize}_${epochs}_${learningRate}`
    const saveResult = await model.save(`downloads://fpnn${settingsName}`)
  }
  return fullResults
}

// export function sketch(p) {
//   let xs
//   let ys
//   let avgTestLoss = 0
//   let lossSum = 0
//   let props = {}

//   p.pushProps = function (_props) {
//     props = _props
//   }
//   p.setup = function (props) {
//     p.createCanvas(768, 400)
//     p.noSmooth()
//     p.noLoop()
//     // translate(100, 200)
//     // NN Constants
//     const numInputs = 5
//     const numNeurons = 256
//     const batchSize = 128
//     const epochs = 100
//     const trainTestRatio = .8
//     const learningRate = 0.1

//     const lstmSize = 100
//     const n_steps = 45
//     const seq_width = 50


//     // const rawData = await HistoricalData.findAll({ order: ['histTime', 'ASC'] })

//     const batchedXData = []
//     let batchXArr = []
//     const batchedYData = []
//     let batchYArr = []
//     props.rawData.forEach(elem => {
//       //scaling
//       const scaled = elem.map((item, i) => {
//         if (i > 0) {
//           return (elem[i] - props.min[i - 1]) / (props.max[i - 1] - props.min[i - 1])
//         }
//       })
//       batchXArr.push(scaled.slice(1))
//       batchYArr.push([scaled[3]])
//       if (batchXArr.length >= batchSize) {
//         batchedXData.push(batchXArr)
//         batchXArr = []
//         batchedYData.push(batchYArr)
//         batchYArr = []
//       }
//     })
//     console.log('batched data length', batchedXData.length)

//     const trainTestSlice = Math.round(batchedXData.length * trainTestRatio)

//     const trainXData = batchedXData.slice(0, trainTestSlice)
//     const testXData = batchedXData.slice(trainTestSlice)
//     const trainYData = batchedYData.slice(0, trainTestSlice)
//     const testYData = batchedYData.slice(trainTestSlice)

//     let model = tf.sequential()

//     // const configHidden = {
//     //   units: 4,
//     //   inputShape: [numInputs, batchSize],
//     //   activation: 'relu',
//     // }
//     // const configOutput = {
//     //   units: 2,
//     //   activation: 'relu'
//     // }

//     // tf.layers.dense() => fully connected layer
//     const hidden = tf.layers.dense({
//       units: numNeurons,
//       inputShape: [numInputs],
//       activation: 'relu',
//     })
//     const output = tf.layers.dense({
//       units: 1,
//       activation: 'relu'
//     })

//     model.add(hidden)
//     model.add(output)

//     const sgdOptimizer = tf.train.sgd(learningRate)

//     // const configCompile = {
//     //   optimizer: sgdOptimizer,
//     //   loss: 'meanSquaredError'
//     // }

//     console.log('pre-compile')
//     model.compile({
//       optimizer: sgdOptimizer,
//       loss: 'meanSquaredError'
//     })
//     console.log('post-compile')

//     console.log('train data length', trainXData.length)
//     const trainDataXs = trainXData.slice(0, trainXData.length - 1)
//     const trainDataYs = trainYData.slice(1)
//     console.log('pre-for loop', trainDataXs.length)

//     for (let i = 0; i < trainDataXs.length - 1; i++) {
//       xs = tf.tensor2d(trainDataXs[i]) //inputs
//       ys = tf.tensor2d(trainDataYs[i]) //expected outputs
//       train()
//     }

//     // console.log('!!!!!!Test Data Results!!!!!!')
//     // console.log('test data length', testXData.length)
//     // const testDataXs = testXData.slice(0, testXData.length - 1)
//     // const testDataYs = testYData.slice(1)
//     // for (let i = 0; i < testDataXs.length - 1; i++) {
//     //   xs = tf.tensor2d(testDataXs[i]) //inputs
//     //   ys = tf.tensor2d(testDataYs[i]) //expected outputs
//     //   test()
//     // }

//     // console.log('Final Loss: ', avgTestLoss)
//     // if (confirm('Save model?')) {
//     //   console.log('saving...')
//     //   const settingsName = `loss_${avgTestLoss}_${numInputs}_${numNeurons}_${batchSize}_${epochs}_${learningRate}`
//     //   const saveResult = await model.save(`downloads://fpnn${settingsName}`)
//     // }
//   }

//   const train = async function () {
//     const configFit = {
//       batchSize: batchSize,
//       epochs: epochs
//     }
//     const response = await model.fit(xs, ys, configFit)
//     const loss = response.history.loss[0]
//     console.log('Rd:', i, '  Train Loss:', loss)
//   }

//   const test = async function () {
//     const configFit = {
//       batchSize: batchSize,
//       epochs: 1
//     }
//     const response = await model.fit(xs, ys, configFit)
//     const loss = response.history.loss[0]
//     lossSum += loss
//     avgTestLoss = lossSum / (i + 1)
//     console.log('Rd:', i, '  Test Loss:', loss)
//   }


//   p.draw = function () {
//     p.background(255);

//     tf.tidy(() => {
//       // Get the predictions
//       let ys = model.predict(xs);
//       let y_values = ys.dataSync();

//       const scaleWidth = (x) => width * x
//       const scaleHeight = (y) => height - height * y
//       // Draw the results
//       let prevX, prevY, ptX, ptY
//       for (let i = 0; i < ys.length; i++) {
//         if (i > 0) {
//           // expected results
//           p.stroke(153)
//           prevX = scaleWidth(xs[3][i - 1])
//           prevY = scaleHeight(ys[0][i - 1])
//           ptX = scaleWidth(xs[3][i])
//           ptY = scaleHeight(ys[0][i])
//           p.line(prevX, prevY, ptX, ptY)

//           // predicted results
//           p.stroke(0)
//           prevX = scaleWidth(xs[3][i - 1])
//           prevY = scaleHeight(ys[0][i - 1])
//           ptX = scaleWidth(xs[3][i])
//           ptY = scaleHeight(ys[0][i])
//           p.line(prevX, prevY, ptX, ptY)
//         }
//       }
//     });
//     p.redraw()
//   }
// }

