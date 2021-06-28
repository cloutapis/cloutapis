'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TagPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TagPost.init({
    clouttag: DataTypes.STRING,
    postHashHex: DataTypes.STRING,
    postedAt: DataTypes.DATE,
    userPublicKeyBase58: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TagPost',
  }); 
  return TagPost;
};