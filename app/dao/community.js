const { Community } = require('../models/community');
const { User } = require('../models/user');
const { UserCommunity } = require('../models/userCommunity');
const { CommunityAnnounce } = require('../models/communityAnnounce');
const { UserInfo } = require('../models/userInfo');
const { Op } = require('sequelize');

class CommunityDao {
    static async create (params) {
        const { userId, ...communityInfo } = params;

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
    static async update(params) {
        const { id, userId, ...remain } = params;
        const { level } = await this.getCurrentUserLevel(userId, id);
        if (level < 10) throw new global.errs.Forbidden('权限不足');
        const hasCommunity = await Community.findOne({
            where: {
                communityName: remain.communityName,
                id: {
                    [Op.ne]: id
                }
            }
        });
        if (hasCommunity) throw new global.errs.Existing('该社团已存在,社团名不可重复');
        await Community.update({
            ...remain,
            updateTime: global.util.getCurrentTimeStamps()
        }, {
            where: {
                id
            }
        }).catch(err => {
            console.log(err);
            throw new global.errs.HttpException('社保信息更新失败');
        });
    }
    static async getInfo (id) {
        const community = await Community.findOne({
            attributes: ['id', 'communityName', 'info', 'avatarUrl', 'backgroundUrl'],
            where: {
                id
            },
            raw: true
        });

        if (!community) return {};

        const announce = await CommunityAnnounce.findAll({
            attributes: ['id', 'userId', 'content', 'updateTime', 'createTime'],
            where: { communityId: id },
            order: [
                ['update_time', 'DESC']
            ],
            raw: true
        });

        if (announce.length > 0) {
            announce[0].userInfo = await UserInfo.findOne({
                attributes: ['nickName', 'gender'],
                where: {
                    uId: announce[0].userId
                },
                raw: true
            }) || {};
        }

        const userNum = await UserCommunity.count({
            where: {
                communityId: id,
                level: {
                    [Op.gte]: 1
                }
            }
        });

        community.announce = announce[0] || {};
        community.userNum = userNum;

        return community;
    }
    static async getUsers (params) {
        return await this.getUserList(params, {
            [Op.gte]: 1
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
    static async pass(id, userId) {
        const userCommunity = await UserCommunity.findByPk(id);
        if (!userCommunity) throw new global.errs.NotFound('找不到该申请记录');
        const { level } = await this.getCurrentUserLevel(userId, userCommunity.communityId);
        if (level < 10) throw new global.errs.Forbidden('权限不足');
        if (userCommunity.level !== 0) throw new global.errs.HttpException('该用户并未申请或已申请通过');
        userCommunity.level = 1;
        userCommunity.save();
    }
    static async addManager(id, userId) {
        const userCommunity = await UserCommunity.findOne({
            where: {id}
        });
        if (!userCommunity) throw new global.errs.NotFound('找不到该申请记录');
        const { level } = await this.getCurrentUserLevel(userId, userCommunity.communityId);
        if (level !== 100) throw new global.errs.Forbidden('权限不足');
        if (userCommunity.level >= 10) throw new global.errs.HttpException('该用户已成为管理员');
        userCommunity.level = 10;
        userCommunity.save();
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
    static async removeUser (id, userId) {
        const userCommunity = await UserCommunity.findByPk(id);
        if (!userCommunity) throw new global.errs.NotFound('找不到该申请记录');
        const { level } = await this.getCurrentUserLevel(userId, userCommunity.communityId);
        if (level !== 100) throw new global.errs.Forbidden('权限不足');
        userCommunity.destroy();
    }
    static async search(params) {
        const { text, size = 10, page = 1 } = params;
        const list = await Community.findAndCountAll({
            attributes: ['id', 'communityName', 'avatarUrl'],
            where: {
                communityName: {
                    [Op.like]: `%${text}%`
                }
            },
            order: [
                ['update_time', 'DESC']
            ],
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
                        attributes: [],
                        where: {
                            level: {
                                [Op.gte]: 1
                            }
                        }
                    },
                    required: true,
                    order: [
                        ['update_time', 'DESC']
                    ]
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
            order: [
                ['update_time', 'DESC']
            ],
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
    static async getSelectCommunityList(params) {
        const { userId, level, size = 10, page = 1 } = params;
        const user = await User.findOne({
            where: { uId: userId }
        });
        if (!user) throw new global.errs.NotFound('用户不存在');
        const list = await UserCommunity.findAndCountAll({
            attributes: ['communityId'],
            where: {
                userId: user.id,
                level: level === 1 ? {
                    [Op.in]: [1, 10]
                } : level
            },
            order: [
                ['update_time', 'DESC']
            ],
            limit: size,
            offset: (page - 1) * size
        });
        if (!list) return {};
        const data = [];
        for (let item of list.rows) {
            const communityInfo = await Community.findOne({
                attributes: ['id', 'avatarUrl', 'communityName'],
                where: { id: item.communityId },
                raw: true
            });
            data.push(communityInfo)
        }
        return {
            data,
            count: list.count,
            totalPage: Math.ceil(list.count / size)
        }
    }
    static async getUserList (params, level) {
        const { communityId, size = 10, page = 1 } = params;
        const list = await UserCommunity.findAndCountAll({
            attributes: ['id', 'userId', 'level', 'nickName', 'gender', 'avatarUrl'],
            where: {
                communityId,
                level
            },
            order: [
                ['update_time', 'DESC']
            ],
            limit: size,
            offset: (page - 1) * size
        });
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