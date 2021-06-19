'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'TagPosts',
      'postObject'
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'TagPosts',
      'postObject',
      Sequelize.TEXT
    );
  }
};
