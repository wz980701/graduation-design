const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize, Model } = require('sequelize');

class User extends Model { }

User.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
        comment: '用户id'
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
    modelName: 'user',
    tableName: 'user'
});

module.exports = {
    User
}