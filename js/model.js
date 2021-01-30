const model = tf.sequential();

model.add(tf.layers.conv2d({
  inputShape: [28, 28, 1],
  kernelSize: 5,
  filters: 8,
  strides: 1,
  activation: 'relu',
  kernelInitializer: 'varianceScaling'
}));
model.add(tf.layers.maxPooling2d({
  poolSize: [2,2],
  strides: [2,2]
}));
model.add(tf.layers.conv2d({
  kernelSize: 5,
  filters: 16,
  strides: 1,
  activation: 'relu',
  kernelInitializer: 'varianceScaling'
}))
model.add(tf.layers.maxPooling2d({
  poolSize: [2,2],
  strides: [2,2]
}));
model.add(tf.layers.flatten());
model.add(tf.layers.dense({
  units:10,
  kernelInitializer: 'varianceScaling',
  activation: 'softmax'
}));

const LEARNING_RATE = 0.15;
const optimizer = tf.train.sgd(LEARNING_RATE);

model.compile({
  optimizer: optimizer,
  loss: 'categoricalCrossentropy'
});
