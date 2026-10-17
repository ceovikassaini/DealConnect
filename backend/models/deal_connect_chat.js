const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('deal_connect_chat', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reciver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    deal_connect_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "''"
    }
  }, {
    sequelize,
    tableName: 'deal_connect_chat',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
