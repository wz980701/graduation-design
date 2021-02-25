const { Community } = require('../models/community');
const { User } = require('../models/user');
const { UserCommunity } = require('../models/userCommunity');
const { CommunityAnnounce } = require('../models/communityAnnounce');
// const { UserInfo } = require('../models/userInfo');
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
            }
        });

        if (!community) throw new global.errs.HttpException('找不到该社团信息');

        return {
            ...community.toJSON()
        };
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
}

module.exports = {
    CommunityDao
}