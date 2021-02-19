const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize, Model } = require('sequelize');

class User extends Model { }

User.init({
    id: {
        type: Sequelize.INTERGER,
        primaryKey: true,
        autoIncrement: true
    },
    openId: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
        comment: '用户id'
    },
    createdAt: {
        
    }
});