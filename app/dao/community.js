const { Community } = require('../models/community');
const { User } = require('../models/user');
const { UserCommunity } = require('../models/userCommunity');
const { CommunityAnnounce } = require('../models/communityAnnounce');
const { UserInfo } = require('../models/userInfo');
const { Op } = require('sequelize');

class CommunityDao {
    static async create (params) {
        const { userId, communityInfo } = params;

        const { communityName } = communityInfo;

        const hasCommunity = await Community.findOne({
            where: { communityName }
        });

        if (hasCommunity) throw new global.errs.Existing('该社团已存在,社团名不可重复');

        const user = await User.findOne({
            where: {
                uId: userId
            }
        });

        const userInfo = await user.getUserInfo({
            attributes: ['nickName', 'gender', 'avatarUrl']
        });

        const community = await Community.create({...communityInfo});
        await community.addUsers(user, { through: { level: 100, ...userInfo.toJSON() }});
    }
    static async get (id) {
        const community = await Community.findOne({
            attributes: ['id', 'communityName', 'info', 'avatarUrl', 'backgroundUrl'],
            where: {
                id
            },
            raw: true
        }) || {};

        const announce = await CommunityAnnounce.findOne({
            attributes: ['id', 'userId', 'content', 'updateTime', 'createTime'],
            where: {
                atTop: true
            },
            raw: true
        }) || {};

        const userInfo = announce && await UserInfo.findOne({
            attributes: ['nickName', 'gender'],
            where: {
                uId: announce.userId
            },
            raw: true
        });

        announce.userInfo = userInfo || {};
        community.announce = announce;

        return community;
    }
    static async getUsers (params) {
        return await this.getUserList(params, {
            [Op.gte]: 0
        }) || [];
    }
    static async getApplyList (params) {
        return await this.getUserList(params, 0) || [];
    }
    static async join (params) {
        const { userId, communityId } = params;
        const user = await User.findOne({
            where: { uId: userId }
        });
        const community = await Community.findOne({
            where: { id: communityId }
        });
        const userInfo = await user.getUserInfo({
            attributes: ['nickName', 'gender', 'avatarUrl']
        });
        await community.addUsers(user, {
            through: {
                level: 0,
                ...userInfo.toJSON()
            }
        });
    }
    static async pass (id) {
        try {
            await UserCommunity.update({
                level: 1
            }, {
                where: { id }
            });
        } catch (err) {
            throw new global.errs.HttpException('更新失败');
        }
    }
    static async getCurrentUserLevel (userId, communityId) {
        const user = await User.findOne({
            attributes: ['id'],
            where: { uId: userId },
            raw: true
        });
        return await UserCommunity.findOne({
            attributes: ['level'],
            where: {
                userId: user.id,
                communityId
            }
        }) || {};
    }
    static async removeUser (params) {
        const { userId, communityId } = params;
        await UserCommunity.destroy({
            where: {
                userId,
                communityId
            }
        }).catch((err) => {
            console.log(err);
            throw new global.errs.HttpException('删除失败');
        });
    }
    static async getUserCommunityList(id) {
        return await User.findAndCountAll({
            attributes: [],
            where: {
                uId: id
            },
            include: [
                {
                    model: Community,
                    attributes: ['id', 'communityName', 'avatarUrl'],
                    through: {
                        attributes: []
                    },
                    required: true
                }
            ]
        });
    }
    static async getAllCommunityList() {
        return await Community.findAndCountAll({
            attributes: ['id', 'communityName', 'avatarUrl']
        }) || [];
    }
    static async getUserList (params, level) {
        const { communityId, size = 20, page = 0 } = params;
        return await UserCommunity.findAndCountAll({
            attributes: ['userId', 'level', 'nickName', 'gender', 'avatarUrl'],
            where: {
                communityId,
                level
            },
            limit: size,
            offset: page * size
        });
    }
    static async setAvatarUrl(url, id) {
        await Community.update({
            avatarUrl: url,
            updateTime: global.util.getCurrentTimeStamps()
        }, {
            where: {
                id
            }
        });
    }
    static async setBackgroundUrl(url, id) {
        await Community.update({
            backgroundUrl: url,
            updateTime: global.util.getCurrentTimeStamps()
        }, {
            where: {
                id
            }
        });
    }
}

module.exports = {
    CommunityDao
}