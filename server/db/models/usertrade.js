const UserTrade = db.define('usertrades', {
  tradeId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  size: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  productId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  side: {
    type: Sequelize.STRING,
    allowNull: false
  },
  stp: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tradeType: {
    type: Sequelize.STRING,
    allowNull: false
  },
  timeInForce: {
    type: Sequelize.STRING,
    allowNull: false
  },
  postOnly: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  tradeCreatedAt: {
    type: Sequelize.STRING,
    allowNull: false
  },
  fillFees: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  filledSize: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  executedValue: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  tradeStatus: {
    type: Sequelize.STRING,
    allowNull: false
  },
  settled: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  sentTrade: {
    type: Sequelize.JSON,
    allowNull: false
  }
})

UserTrade.beforeValidate((tradeObj) => {
  tradeObj.price = +tradeObj.price
  tradeObj.size = +tradeObj.size
  tradeObj.fillFees = +tradeObj.fillFees
  tradeObj.filledSize = +tradeObj.filledSize
  tradeObj.executedValue = +tradeObj.executedValue
})
