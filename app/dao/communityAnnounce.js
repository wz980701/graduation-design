const { CommunityAnnounce } = require('../models/communityAnnounce');
const { UserInfo } = require('../models/userInfo');

class CommunityAnnounceDao {
    static async addAnnounce (params) {
        try {
            await CommunityAnnounce.create({
                ...params,
                updateTime: global.util.getCurrentTimeStamps()
            })
        } catch (err) {
            throw new global.errs.HttpException('创建失败');
        }
    }
    static async getAnnounceList (params) {
        const { communityId, size = 20, page = 0 } = params;
        const list = await CommunityAnnounce.findAndCountAll({
            attributes: ['id', 'userId', 'content', 'updateTime', 'createTime'],
            where: {
                communityId
            },
            limit: size,
            offset: page * size
        });
        // rows项需要增加userInfo
        return list;
    }
    static async updateAnnounce (params) {
        try {
            await CommunityAnnounceDao.update({

            });
        } catch (err) {
            throw new global.errs.HttpException('更新失败');
        }
    }
}

module.exports = {
    CommunityAnnounceDao
}