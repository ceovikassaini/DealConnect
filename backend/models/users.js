const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1=>customer, 2=>dealer, 3=>admin"
    },
    mobile_no: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ""
    },
    otp: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ""
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "0=>inactive, 1=>active"
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ""
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ""
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ""
    },
    is_approve: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "0=>Pending, 1=>Approve, 2=>Rejected"
    }
  }, {
    sequelize,
    tableName: 'users',
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
