const db = require('../db')
const Sequelize = require('sequelize')

const Order = db.define('orders', {
  orderType: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tradeId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  sequence: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  makerOrderId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  takerOrderId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  time: {
    type: Sequelize.DATE,
    allowNull: false
  },
  productId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  size: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  side: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

Order.beforeValidate((order) => {
  order.time = Date(order.time)
  order.size = +order.size
  order.price = +order.price
})
