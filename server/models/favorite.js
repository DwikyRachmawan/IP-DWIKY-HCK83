'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    static associate(models) {
      Favorite.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  
  Favorite.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    digimonName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Digimon name is required' },
        notEmpty: { msg: 'Digimon name cannot be empty' }
      }
    },
    digimonLevel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    digimonImage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Favorite',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'digimonName']
      }
    ]
  });

  return Favorite;
};
