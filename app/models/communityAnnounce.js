const moment = require('moment');
const { sequelize } = require('../../core/db');
const { Sequelize } = require('sequelize');

const { Community } = require('./community');

const CommunityAnnounce = sequelize.define('communityAnnounce', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: '用户id'
    },
    content: {
        type: Sequelize.TEXT('medium'),
        allowNull: false,
        comment: '公告内容'
    },
    atTop: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否置顶'
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
            return moment(this.getDataValue('updateTime')).format('YYYY-MM-DD');
        }
    }
}, {
    freezeTableName: true
});

Community.hasMany(CommunityAnnounce);
CommunityAnnounce.belongsTo(Community);

module.exports = {
    CommunityAnnounce
}

