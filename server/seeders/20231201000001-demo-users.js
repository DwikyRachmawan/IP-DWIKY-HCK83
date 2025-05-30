'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        email: 'trainer1@digimon.com',
        password: await bcrypt.hash('password123', 10),
        username: 'DigiTrainer1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'trainer2@digimon.com',
        password: await bcrypt.hash('password123', 10),
        username: 'DigiTrainer2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
