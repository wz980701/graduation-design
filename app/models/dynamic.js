const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize } = require('sequelize');

const { Like } = require('./like');
const { Comment } = require('./comment');

const Dynamic = sequelize.define('dynamic', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: Sequelize.TEXT('medium'),
        allowNull: false,
        comment: '动态内容'
    },
    img: {
        type: Sequelize.STRING,
        comment: '图片'
    },
    userId: {
        type: Sequelize.STRING
    },
    communityId: {
        type: Sequelize.INTEGER
    },
    isCommunity: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    browseTimes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

Dynamic.hasMany(Like);
Dynamic.hasMany(Comment);

Like.belongsTo(Dynamic);
Comment.belongsTo(Dynamic);

module.exports = {
    Dynamic
}