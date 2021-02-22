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
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue('createTime')).format('YYYY-MM-DD');
        }
    }
}, {
    sequelize,
    modelName: 'userInfo',
    tableName: 'userInfo'
});

User.hasOne(UserInfo, {
    foreignKey: 'userId'
});

UserInfo.belongsTo(User);

module.exports = {
    UserInfo
}
