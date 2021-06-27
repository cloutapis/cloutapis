'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'TagPosts',
      'userPublicKeyBase58',
      Sequelize.STRING
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'TagPosts',
      'userPublicKeyBase58'
    );
  }
};
