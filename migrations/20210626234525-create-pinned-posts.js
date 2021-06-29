'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PinnedPosts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      publicKey: {
        type: Sequelize.STRING
      },
      postHashHex: {
        type: Sequelize.STRING
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

    await queryInterface.addIndex('PinnedPosts', ['publicKey']);
    await queryInterface.addConstraint('PinnedPosts', {
      fields: ['publicKey'],
      type: 'unique',
      name: 'unique_publicKey'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PinnedPosts');
  }
};