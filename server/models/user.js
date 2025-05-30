'use strict';
const { hashPassword, comparePassword } = require('../helpers/bcrypt');

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.FusionHistory, { foreignKey: 'userId' });
      User.hasMany(models.Favorite, { foreignKey: 'userId' });
    }
  }
  User.init({
    username: { // Kembali ke username sesuai migration
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Username is required' },
        notEmpty: { msg: 'Username cannot be empty' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: 'Email is required' },
        notEmpty: { msg: 'Email cannot be empty' },
        isEmail: { msg: 'Invalid email format' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password is required' },
        notEmpty: { msg: 'Password cannot be empty' }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: (user) => {
        user.password = hashPassword(user.password);
      },
      beforeUpdate: (user) => {
        if (user.changed('password')) {
          user.password = hashPassword(user.password);
        }
      }
    }
  }); // Tambahkan semicolon yang hilang

  // Tambahkan instance method untuk check password
  User.prototype.checkPassword = function(password) {
    return comparePassword(password, this.password);
  };

  return User;
};
