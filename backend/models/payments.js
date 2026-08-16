const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payments', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "1=>passpayment,2=>payment,"
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    payment_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    tableName: 'payments',
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
