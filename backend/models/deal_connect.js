const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('deal_connect', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "user",
      references: {
        model: 'users',
        key: 'id'
      }
    },
    dealer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "dealer",
      references: {
        model: 'users',
        key: 'id'
      }
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'property',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1=>User showed interest,2=> Dealer accepted lead,3=> Dealer contacted user,4=>Site visit scheduled,5=> Site visit completed,"
    }
  }, {
    sequelize,
    tableName: 'deal_connect',
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
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "dealer_id",
        using: "BTREE",
        fields: [
          { name: "dealer_id" },
        ]
      },
      {
        name: "property_id",
        using: "BTREE",
        fields: [
          { name: "property_id" },
        ]
      },
    ]
  });
};
