const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize } = require('sequelize');

const { Community } = require('./community');

const Image = sequelize.define('image', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: Sequelize.STRING,
        comment: '图片路径'
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

Community.hasMany(Image);
Image.belongsTo(Community);

module.exports = {
    Image
}