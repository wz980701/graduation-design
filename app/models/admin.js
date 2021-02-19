const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize, Model } = require('sequelize');

class Admin extends Model { }

Admin.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: '用户名'
    },
    password: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: '用户密码'
    },
    createTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue('createTime')).format('YYYY-MM-DD');
        }
    }
}, {
        sequelize,
        modelName: 'admin',
        tableName: 'admin'
});

module.exports = {
    Admin
}
