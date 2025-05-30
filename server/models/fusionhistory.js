'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FusionHistory extends Model {
    static associate(models) {
      FusionHistory.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  FusionHistory.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    digimon1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    digimon2: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fusionName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fusionDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imagePrompt: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'FusionHistory',
  });
  return FusionHistory;
};
