'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ApiMetadata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      api: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: false
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: false
      },
      intValue: {
        type: Sequelize.INTEGER,
        allowNull: true,
        primaryKey: false
      },
      stringValue: {
        type: Sequelize.STRING,
        allowNull: true,
        primaryKey: false
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ApiMetadata');
  }
};
