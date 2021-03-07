const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize } = require('sequelize');

const { User } = require('./user');

const UserInfo = sequelize.define('userInfo', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uId: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
        comment: '用户id'
    },
    nickName: {
        type: Sequelize.STRING(64),
        comment: '用户名'
    },
    gender: {
        type: Sequelize.INTEGER,
        comment: '性别'
    },
    avatarUrl: {
        type: Sequelize.STRING,
        comment: '头像路径'
    },
    createTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue('createTime')).format('YYYY-MM-DD HH:mm:ss');
        }
    },
    updateTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue('updateTime')).format('YYYY-MM-DD HH:mm:ss');
        }
    }
}, {
    freezeTableName: true
});

User.hasOne(UserInfo);
UserInfo.belongsTo(User);

module.exports = {
    UserInfo
}
