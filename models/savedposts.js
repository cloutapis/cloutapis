'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SavedPosts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  SavedPosts.init({
    publicKey: DataTypes.STRING,
    postHashHex: DataTypes.STRING,
    postedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'SavedPosts',
  });
  return SavedPosts;
};