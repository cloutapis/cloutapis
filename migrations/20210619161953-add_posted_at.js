'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'TagPosts',
      'postedAt',
      Sequelize.DATE
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'TagPosts',
      'postedAt'
    );
  }
};
