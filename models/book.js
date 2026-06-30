const { DataTypes } = require('sequelize');
const dbConnection = require('../db')

// TODO: Workshop Part 2: add one key per field below, each set to a DataTypes type
// (and allowNull/defaultValue where noted). id is created automatically.
//   title          STRING   required
//   author         STRING   required
//   genre          STRING
//   publishedYear  INTEGER
//   available      BOOLEAN  defaults to true
const Book = dbConnection.define('book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING,
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    available: {
        type: DataTypes.BOOLEAN,
    },
    publishedYear: {
        type: DataTypes.INTEGER,
        defaultValue: true,
    },
})

module.exports = Book