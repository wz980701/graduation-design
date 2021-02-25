const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize } = require('sequelize');

const { User } = require('./user');
const { UserCommunity } = require('./userCommunity');

const Community = sequelize.define('community', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    communityName: {
        type: Sequelize.STRING(64),
        comment: '社团名'
    },
    info: {
        type: Sequelize.TEXT('medium'),
        comment: '社团介绍'
    },
    avatarUrl: {
        type: Sequelize.STRING,
        comment: '社团头像url'
    },
    backgroundUrl: {
        type: Sequelize.STRING,
        comment: '社团背景图片url'
    },
    createTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue('createTime')).format('YYYY-MM-DD');
        }
    },
    updateTime: {
        type: Sequelize.DATE,
        get() {
            return moment(this.getDataValue('createTime')).format('YYYY-MM-DD');
        }
    }
}, {
    freezeTableName: true
});

User.belongsToMany(Community, {
    through: UserCommunity,
    foreignKey: 'userId'
});

Community.belongsToMany(User, {
    through: UserCommunity,
    foreignKey: 'communityId'
});

module.exports = {
    Community
}