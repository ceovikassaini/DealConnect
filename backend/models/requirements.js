const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('requirements', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    dealer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subcategory_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    budget: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    minBudget: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    maxBudget: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    reqType: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1=>Buy,2=>Rent, 3=>Lease"
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Active",
      comment: "Active, Matched, Closed,"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'requirements',
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
