'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SavedPosts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      publicKey: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      postHashHex: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      postedAt: {
        type: Sequelize.DATE
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

    await queryInterface.addIndex('SavedPosts', ['publicKey']);
    await queryInterface.addIndex('SavedPosts', ['postHashHex']);
    await queryInterface.addConstraint('SavedPosts', {
      fields: ['publicKey', 'postHashHex'],
      type: 'unique',
      name: 'unique_publicKey_post_map'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SavedPosts');
  }
};