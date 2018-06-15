const tf = require("@tensorflow/tfjs");

// Load the binding:
require("@tensorflow/tfjs-node"); // Use '@tensorflow/tfjs-node-gpu' if running with GPU.

const batchSize = 100;
const lstmSize = 100;
const n_steps = 45
const seq_width = 50

// let lstm = tf.contrib.rnn.BasicLSTMCall(lstmSize)

const lstmKernelArr = Array.apply(null, { length: 128 }).map(() => {
  return Array.apply(null, { length: 10 }).map(() => Math.random() / 100)
})
const lstmBiasArr = Array.apply(null, { length: 10 }).map(() => Math.random() / 100)
const lstmInitArr = Array.apply(null, { length: 128 }).map(() => {
  return Array.apply(null, { length: 10 }).map(() => 0)
})

let forgetBias = tf.scalar(1.0)
let lstmKernel = tf.tensor2d(lstmKernelArr)
let lstmBias = tf.tensor1d(Array.apply(null, { length: 10 }).map(() => 0))
let c
let h
// const buildLstm = (forgetBias, kernel, bias, c, h) => {
//   const res = await TensorFlow.findAll({ order: ['histTime', 'ASC'] })
//   const data = res.map(item => Object.values(item.dataValues).slice(1))
// }
// const lstm = buildLstm(forgetBias, lstmKernel, lstmBias, c, h).then(() => {
//   console.log(lstmBias, lstm)
// })

