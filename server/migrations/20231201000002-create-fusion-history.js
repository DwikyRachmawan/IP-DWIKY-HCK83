'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FusionHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      digimon1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      digimon2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fusionName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fusionDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FusionHistories');
  }
};
