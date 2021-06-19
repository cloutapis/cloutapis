'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TagPosts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tag: {
        type: Sequelize.STRING
      },
      postHashHex: {
        type: Sequelize.STRING
      },
      postObject: {
        type: Sequelize.TEXT
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
    await queryInterface.addIndex('TagPosts', ['tag']);
    await queryInterface.addIndex('TagPosts', ['postHashHex']);
    await queryInterface.addConstraint('TagPosts', {
      fields: ['postHashHex', 'tag'],
      type: 'unique',
      name: 'unique_tag_post_map'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TagPosts');
  }
};