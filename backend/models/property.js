const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('property', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    subcategory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    dealer_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Height In Foot"
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Width In Foot"
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "0=>Inactive, 1=>Active"
    },
    price: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "Numeric price in Rupees (e.g. 3850000.00 for 38.5 Lakh)"
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "Sonipat, Haryana"
    },
    area: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "100 Sq. Yd."
    },
    facing: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "Road Facing"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dealerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "Sharma Associates"
    },
    propertyType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "'Plot'"
    },
    society: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    flat_no: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    other_details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    badge_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'property',
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
