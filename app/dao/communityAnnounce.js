const { CommunityAnnounce } = require('../models/communityAnnounce');
const { Community } = require('../models/community');
const { UserInfo } = require('../models/userInfo');
const { CommunityDao } = require('./community');

class CommunityAnnounceDao {
    static async addAnnounce(params) {
        const { communityId, ...remain } = params;
        const { level } = await CommunityDao.getCurrentUserLevel(remain.userId, communityId);
        if (level < 10) throw new global.errs.Forbidden('权限不足');
        const community = await Community.findOne({
            where: {
                id: communityId
            } 
        });
        if (!community) throw new global.errs.NotFound('未找到该社团');
        const announce = await CommunityAnnounce.create({
            ...remain,
            updateTime: global.util.getCurrentTimeStamps()
        }).catch(err => {
            throw new global.errs.HttpException('创建公告失败');
        });
        community.addCommunityAnnounces(announce);
    }
    static async getAnnounceList (params) {
        const { communityId, userId, size = 10, page = 1 } = params;
        const list = await CommunityAnnounce.findAndCountAll({
            attributes: ['id', 'userId', 'content', 'updateTime', 'createTime'],
            where: {
                communityId
            },
            order: [
                ['update_time', 'DESC']
            ],
            limit: size,
            offset: (page - 1) * size,
            raw: true
        });

        if (!list) return {}

        const rows = list.rows;
        
        for (let item of rows) {
            const userInfo = await UserInfo.findOne({
                attributes: ['nickName', 'avatarUrl'],
                where: {
                    uId: item.userId
                },
                raw: true 
            });
            item.userInfo = userInfo;
            item.isCurrentUser = item.userId === userId;
        }

        return {
            data: list.rows,
            count: list.count,
            totalPage: Math.ceil(list.count / size)
        }
    }
    static async updateAnnounce (params) {
        const { id, content, userId } = params;
        const announce = await CommunityAnnounce.findByPk(id);
        if (!announce) throw new global.errs.NotFound('未找到该公告记录');
        const { level } = await CommunityDao.getCurrentUserLevel(userId, announce.communityId);
        if (level < 10) throw new global.errs.Forbidden('权限不足');
        announce.content = content;
        announce.updateTime = global.util.getCurrentTimeStamps();
        announce.save();
    }
    static async deleteAnnounce(id, userId) {
        const announce = await CommunityAnnounce.findByPk(id);
        if (!announce) throw new global.errs.NotFound('未找到该公告记录');
        const { level } = await CommunityDao.getCurrentUserLevel(userId, announce.communityId);
        if (level < 10) throw new global.errs.Forbidden('权限不足');
        announce.destroy();
    }
}

module.exports = {
    CommunityAnnounceDao
}