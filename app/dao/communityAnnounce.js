const { CommunityAnnounce } = require('../models/communityAnnounce');
const { Community } = require('../models/community');
const { UserInfo } = require('../models/userInfo');

class CommunityAnnounceDao {
    static async addAnnounce(params) {
        const { communityId, ...remain } = params;
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
        community.setCommunityAnnounces(announce);
    }
    static async getAnnounceList (params) {
        const { communityId, size = 10, page = 1 } = params;
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
                attributes: ['nickName', 'gender'],
                where: {
                    uId: item.userId
                },
                raw: true 
            });
            item.userInfo = userInfo;
        }

        return {
            data: list.rows,
            count: list.count,
            totalPage: Math.ceil(list.count / size)
        }
    }
    static async updateAnnounce (params) {
        const { id, content } = params;
        await CommunityAnnounce.update({
            content,
            updateTime: global.util.getCurrentTimeStamps()
        }, {
            where: {
                id
            }
        }).catch(err => {
            throw new global.errs.HttpException('编辑公告失败');
        });
    }
    static async deleteAnnounce (id) {
        await CommunityAnnounce.destroy({
            where: {
                id
            }
        }).catch(err => {
            throw new global.errs.HttpException('删除公告失败');
        });
    }
}

module.exports = {
    CommunityAnnounceDao
}