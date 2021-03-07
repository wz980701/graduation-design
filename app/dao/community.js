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

        if (!user) throw new global.errs.NotFound('用户不存在');

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
        });

        if (!community) return {};

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
        });
    }
    static async getApplyList (params) {
        return await this.getUserList(params, 0);
    }
    static async join (params) {
        const { userId, communityId } = params;
        const user = await User.findOne({
            where: { uId: userId }
        });
        if (!user) throw new global.errs.NotFound('用户不存在');
        const community = await Community.findByPk(communityId);
        if (!community) throw new global.errs.NotFound('社团不存在');
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
        await UserCommunity.update({
            level: 1
        }, {
            where: { id }
        }).catch(err => {
            throw new global.errs.HttpException('用户通过失败');
        });
    }
    static async getCurrentUserLevel (userId, communityId) {
        const user = await User.findOne({
            attributes: ['id'],
            where: { uId: userId },
            raw: true
        });
        if (!user) throw new global.errs.NotFound('用户不存在');
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
        }).catch(err => {
            throw new global.errs.HttpException('删除用户失败');
        });
    }
    static async search(params) {
        const { text, size = 10, page = 1 } = params;
        const list = await Community.findAndCountAll({
            attributes: ['id', 'communityName', 'avatarUrl'],
            where: {
                [Op.like]: `%${text}$`
            },
            limit: size,
            offset: (page - 1) * size
        });
        if (!list) return {};
        return {
            data: list.rows,
            count: list.count,
            totalPage: Math.ceil(list.count / size)
        }
    }
    static async getUserCommunityList(params) {
        const { userId, size = 10, page = 1 } = params;
        const list = await User.findAndCountAll({
            attributes: [],
            where: {
                uId: userId
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
            ],
            limit: size,
            offset: (page - 1) * size
        });
        if (!list) return {};
        return {
            data: list.rows[0].communities,
            count: list.count,
            totalPage: Math.ceil(list.count / size)
        }
    }
    static async getAllCommunityList(params) {
        const { size = 10, page = 1 } = params;
        const list = await Community.findAndCountAll({
            attributes: ['id', 'communityName', 'avatarUrl'],
            limit: size,
            offset: (page - 1) * size
        });
        if (!list) return {}
        return {
            data: list.rows,
            count: list.count,
            totalPage: Math.ceil(list.count / size)
        }
    }
    static async getUserList (params, level) {
        const { communityId, size = 10, page = 1 } = params;
        const list = await UserCommunity.findAndCountAll({
            attributes: ['userId', 'level', 'nickName', 'gender', 'avatarUrl'],
            where: {
                communityId,
                level
            },
            limit: size,
            offset: (page - 1) * size
        });
        if (!list) return {};
        return {
            data: list.rows,
            count: list.count,
            totalPage: Math.ceil(list.count / size)
        }
    }
    static async setAvatarUrl(url, id) {
        await Community.update({
            avatarUrl: url,
            updateTime: global.util.getCurrentTimeStamps()
        }, {
            where: {
                id
            }
        }).catch(err => {
            throw new global.errs.HttpException('设置头像失败');
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
        }).catch(err => {
            throw new global.errs.HttpException('设置背景头像失败');
        });
    }
}

module.exports = {
    CommunityDao
}