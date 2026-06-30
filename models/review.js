const { DataTypes } = require('sequelize');
const dbConnection = require('../db')

const Review = dbConnection.define('review', {
    reviewer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: DataTypes.TEXT,
    },
})

module.exports = Review