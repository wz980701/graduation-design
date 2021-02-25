const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize } = require('sequelize');

const User = sequelize.define('user', {
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
    createTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        get() {
            return moment(this.getDataValue('createTime')).format('YYYY-MM-DD');
        }
    }
}, {
    freezeTableName: true
});

module.exports = {
    User
}