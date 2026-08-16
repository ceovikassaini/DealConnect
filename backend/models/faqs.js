const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('faqs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "''"
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "''"
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: "active"
    }
  }, {
    sequelize,
    tableName: 'faqs',
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
