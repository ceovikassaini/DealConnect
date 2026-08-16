const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('safety', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    subtitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_intro: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_point_1_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_point_1_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_point_2_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_point_2_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_point_3_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_point_3_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_point_4_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_point_4_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_outro: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    rider_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    rider_point_1_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    rider_point_1_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    rider_point_2_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    rider_point_2_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    rider_point_3_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    rider_point_3_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_section_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_section_point_1_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_section_point_1_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_section_point_2_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_section_point_2_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_section_point_3_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_section_point_3_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_section_point_4_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    driver_section_point_4_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },
    driver_section_outro: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'safety',
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
