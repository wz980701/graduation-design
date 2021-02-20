const { sequelize } = require('../../core/db');
const { Sequelize, Model } = require('sequelize');

const { User } = require('./user');

class UserInfo extends Model { }

UserInfo.init({
    id: {
        type: Sequelize.INTERGER,
        primaryKey: true,
        autoIncrement: true
    },
    nickName: {
        type: Sequelize.STRING(64),
        comment: '用户名'
    },
    gender: {
        type: Sequelize.INTERGER,
        comment: '性别'
    },
    avatarUrl: {
        type: Sequelize.STRING,
        comment: '头像路径'
    }
});

User.hasOne(UserInfo);

UserInfo.belongsTo(User);

module.exports = {
    UserInfo
}
