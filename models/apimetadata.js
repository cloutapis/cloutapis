'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ApiMetadata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ApiMetadata.init({
    api: DataTypes.STRING,
    key: DataTypes.STRING,
    intValue: DataTypes.INTEGER,
    stringValue: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'ApiMetadata',
  }); 
  return ApiMetadata;
};