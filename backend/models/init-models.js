var DataTypes = require("sequelize").DataTypes;
var _requirements = require("./requirements");

function initModels(sequelize) {
  var requirements = _requirements(sequelize, DataTypes);


  return {
    requirements,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
