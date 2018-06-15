const tf = require("@tensorflow/tfjs");

// Load the binding:
require("@tensorflow/tfjs-node"); // Use '@tensorflow/tfjs-node-gpu' if running with GPU.

const batchSize = 100;
const lstmSize = 100;

//let lstm = tf.contrib.rnn.BasicLSTMCall(lstmSize)

const lstmKernelArr = Array.apply(null, { length: 128 }).map(() => {
  return Array.apply(null, { length: 10 }).map(() => Math.random() / 100);
});
const lstmBiasArr = Array.apply(null, { length: 10 }).map(
  () => Math.random() / 100
);

let lstmKernel = tf.tensor2d(lstmKernelArr);
let lstmBias = tf.tensor1d(Array.apply(null, { length: 10 }).map(() => 0));

console.log(lstmBias);
