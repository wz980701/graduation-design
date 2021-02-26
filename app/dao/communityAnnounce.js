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
            console.log(err);
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
            offset: page * size,
            raw: true
        });

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

        return list;
    }
    static async updateAnnounce (params) {
        const { id, content, atTop } = params;
        try {
            await CommunityAnnounce.update({
                content,
                atTop,
                updateTime: global.util.getCurrentTimeStamps()
            }, {
                where: {
                    id
                }
            });
        } catch (err) {
            console.log(err);
            throw new global.errs.HttpException('更新失败');
        }
    }
    static async deleteAnnounce (id) {
        try {
            await CommunityAnnounce.destroy({
                where: {
                    id
                }
            }).then((res) => {
                console.log(res);
            })
        } catch (err) {
            console.log(err);
            throw new global.errs.HttpException('删除失败');
        }
    }
}

module.exports = {
    CommunityAnnounceDao
}