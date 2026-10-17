var DataTypes = require("sequelize").DataTypes;
var _subscription_buy = require("./subscription_buy");

function initModels(sequelize) {
  var subscription_buy = _subscription_buy(sequelize, DataTypes);


  return {
    subscription_buy,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
