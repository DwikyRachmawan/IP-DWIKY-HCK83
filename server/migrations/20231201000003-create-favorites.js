'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Favorites', {
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
      digimonName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      digimonLevel: {
        type: Sequelize.STRING,
        allowNull: true
      },
      digimonImage: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add unique constraint to prevent duplicate favorites
    await queryInterface.addIndex('Favorites', {
      fields: ['userId', 'digimonName'],
      unique: true,
      name: 'unique_user_digimon_favorite'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Favorites');
  }
};
