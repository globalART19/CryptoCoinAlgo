import { TensorFlow } from '../server/db/models/tensorflow'

const batchSize = 100;
const lstmSize = 100;

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
// let c = tf.
// const buildLstm = () => {
//   const res = await TensorFlow.findAll({ order: ['histTime', 'ASC'] })
//   const data = res.map(item => Object.values(item.dataValues).slice(1))

// }
// const lstm = buildLstm()

console.log(lstmBias)













// Define a model for linear regression.
const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

// Prepare the model for training: Specify the loss and the optimizer.
model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

// Generate some synthetic data for training.
const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

// Train the model using the data.
model.fit(xs, ys, { epochs: 10 }).then(() => {
  // Use the model to do inference on a data point the model hasn't seen before:
  // Open the browser devtools to see the output
  model.predict(tf.tensor2d([5], [1, 1])).print();
});
