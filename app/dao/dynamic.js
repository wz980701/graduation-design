const { Dynamic } = require('../models/dynamic');
const { UserInfo } = require('../models/userInfo');
const { User } = require('../models/user');
const { Community } = require('../models/community');
const { Like } = require('../models/like');
const { Comment } = require('../models/comment');
const { CommunityDao } = require('./community');

class DynamicDao {
    static async release(params) {
        const { userId, communityId } = params;
        const user = await User.findOne({
            where: { uId: userId }
        });
        if (!user) throw new global.errs.NotFound('未找到该用户');
        if (communityId) {
            const community = await Community.findByPk(communityId);
            if (!community) throw new global.errs.NotFound('未找到该社团');
            const { level } = await CommunityDao.getCurrentUserLevel(userId, communityId);
            if (level < 10) throw new global.errs.Forbidden('权限不足');
        }
        await Dynamic.create({ ...params }).catch(err => {
            throw new global.errs.HttpException('创建动态失败');
        });
    }
    static async edit(params) {
        const { dynamicId, userId, ...remain } = params;
        const dynamic = await Dynamic.findByPk(dynamicId);
        if (!dynamic) throw new global.errs.NotFound('未找到该动态');
        if (dynamic.isCommunity) {
            const { level } = await CommunityDao.getCurrentUserLevel(userId, dynamic.communityId);
            if (level < 10) throw new global.errs.Forbidden('权限不足');
        } else if (!dynamic.isCommunity && dynamic.userId !== userId) {
            throw new global.errs.Forbidden('没有权限编辑该动态');
        }
        dynamic.content = remain.content;
        dynamic.img = remain.img;
        dynamic.updateTime = global.util.getCurrentTimeStamps();
        dynamic.save();
    }
    static async remove(id, userId) {
        const dynamic = await Dynamic.findByPk(id);
        if (!dynamic) throw new global.errs.NotFound('未找到该动态');
        if (dynamic.isCommunity) {
            const { level } = await CommunityDao.getCurrentUserLevel(userId, dynamic.communityId);
            if (level < 10) throw new global.errs.Forbidden('权限不足');
        } else if (!dynamic.isCommunity && dynamic.userId !== userId) {
            throw new global.errs.Forbidden('没有权限编辑该动态');
        }
        dynamic.destroy();
    }
    static async getDetail(params) {
        const { dynamicId, userId: currentUserId } = params;
        const data = await Dynamic.scope('iv').findByPk(dynamicId);
        if (!data) throw new global.errs.NotFound('没有找到相关动态');
        const userInfo = await this.getUserInfo(currentUserId);
        const likeNum = await Like.count({
            where: { dynamicId }
        });
        let isCurrentUser;
        currentUserId && (data.isCurrentUser = currentUserId === data.userId);
        return {
            ...data.dataValues,
            userInfo,
            likeNum,
            isCurrentUser
        };
    }
    static async getUserList(params) {
        const { size = 10, page = 1, userId } = params;
        return await this.getDynamicList({
            isCommunity: false
        }, size, page, userId);
    }
    static async getOwnerList(params) {
        const { size = 10, page = 1, userId } = params;
        return await this.getDynamicList({
            isCommunity: false,
            userId
        }, size, page, userId);
    }
    static async getCommunityList(params) {
        const { size = 10, page = 1, communityId, userId } = params;
        return await this.getDynamicList({
            isCommunity: true,
            communityId
        }, size, page, userId);
    }
    static async remove(id) {
        await Dynamic.destroy({
            where: { id }
        }).catch(err => {
            throw new global.errs.HttpException('删除动态失败');
        });
    }
    static async like(params) {
        const { userId, dynamicId } = params;
        const hasUserLike = await Like.findOne({
            where: {
                dynamicId,
                userId
            }
        });
        if (hasUserLike) {
            hasUserLike.like = !hasUserLike.like;
            hasUserLike.updateTime = global.util.getCurrentTimeStamps();
            hasUserLike.save();
            return hasUserLike.like ? '点赞成功' : '取消点赞成功';
        } else {
            await Like.create({
                like: true,
                dynamicId,
                userId
            }).then(res => {
                return '点赞成功';
            }).catch (err => {
                throw new global.errs.HttpException('删除动态失败');
            });
        }
    }
    static async addComment(params) {
        const { dynamicId, ...comment } = params;
        const dynamic = await Dynamic.findByPk(dynamicId);
        if (!dynamic) throw new global.errs.NotFound('获取不到该动态');
        const newComment = await Comment.create(comment).catch(err => {
            throw new global.errs.HttpException('创建动态失败');
        });
        dynamic.addComments(newComment);
    }
    static async editComment(params) {
        const { id, userId, content } = params;
        const comment = await Comment.findByPk(id);
        if (!comment) throw new global.errs.NotFound('未找到该评论');
        if (comment.userId !== userId) throw new global.errs.Forbidden('没有权限编辑该动态');
        comment.content = content;
        comment.updateTime = global.util.getCurrentTimeStamps();
        comment.save();
    }
    static async removeComment(id, userId) {
        const comment = await Comment.findByPk(id);
        if (!comment) throw new global.errs.NotFound('未找到该评论');
        if (comment.userId !== userId) throw new global.errs.Forbidden('没有权限编辑该动态');
        comment.destroy();
    }
    static async getCommentList (params) {
        const { userId: currentUserId, dynamicId, size, page } = params;
        const comment = await Comment.scope('iv').findAndCountAll({
            where: {
                dynamicId
            },
            limit: size,
            offset: (page - 1) * size,
            order: [
                ['update_time', 'DESC']
            ],
            raw: true
        });
        for (let item of comment.rows) {
            const userInfo = await this.getUserInfo(item.userId);
            currentUserId && (item.isCurrentUser = currentUserId === item.userId);
            item.userInfo = userInfo;
        }
        return {
            data: comment.rows,
            count: comment.count,
            totalPage: Math.ceil(comment.count / size)
        }
    }
    static async getUserInfo(userId) {
        const data = await UserInfo.findOne({
            attributes: ['nickName', 'avatarUrl', 'gender'],
            where: {
                uId: userId
            }
        });
        if (!data) throw new global.errs.NotFound('获取不到用户信息');
        return data;
    }
    static async getDynamicList(condition, size, page, currentUserId) {
        const data = await Dynamic.findAndCountAll({
            attributes: ['id','content','img','userId','createTime','updateTime'],
            where: condition,
            limit: size,
            order: [
                ['update_time', 'DESC']
            ],
            offset: (page - 1) * size,
            raw: true
        });
        if (!data) return {};
        for (let item of data.rows) {
            const { id, userId } = item;
            const likeNum = await Like.count({
                where: { dynamicId: id }
            });
            const isLike = await Like.findOne({
                where: { userId: currentUserId, dynamicId: id }
            }).then((res) => {
                return res ? true : false;
            });
            const userInfo = await this.getUserInfo(userId);
            item.isLike = isLike;
            item.likeNum = likeNum;
            item.userInfo = userInfo;
        }
        return {
            data: data.rows,
            count: data.count,
            totalPage: Math.ceil(data.count / size)
        };
    }
}

module.exports = {
    DynamicDao
}