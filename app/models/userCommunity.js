const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize } = require('sequelize');

const UserCommunity = sequelize.define('userCommunity', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    communityId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    level: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: '权限等级'
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

module.exports = {
    UserCommunity
}
