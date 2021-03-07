const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize } = require('sequelize');

const Like = sequelize.define('like', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    like: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '点赞'
    },
    userId: {
        type: Sequelize.STRING,
        allowNull: false
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
    Like
}