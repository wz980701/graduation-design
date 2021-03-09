const { Dynamic } = require('../models/dynamic');
const { UserInfo } = require('../models/userInfo');
const { User } = require('../models/user');
const { community, Community } = require('../models/community');
const { Like } = require('../models/like');
const { Comment } = require('../models/comment');

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
        }
        await Dynamic.create({ ...params }).catch(err => {
            throw new global.errs.HttpException('创建动态失败');
        });
    }
    static async edit(params) {
        const { dynamicId, ...remain } = params;
        await Dynamic.update({
            ...remain,
            updateTime: global.util.getCurrentTimeStamps()
        }, {
            where: {
                id: dynamicId
            }
        }).catch(err => {
            throw new global.errs.HttpException('编辑动态失败');
        });
    }
    static async remove(id) {
        await Dynamic.destroy({
            where: { id }
        }).catch(err => {
            throw new global.errs.HttpException('删除动态失败');
        });
    }
    static async getDetail(id) {
        const data = await Dynamic.scope('iv').findByPk(id).catch(err => {
            throw new global.errs.NotFound('没有找到相关动态');
        });
        return data;
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
        const { id, ...comment } = params;
        await Comment.update({
            ...comment,
            updateTime: global.util.getCurrentTimeStamps()
        }, {
            where: {
                id
            }
        }).catch(err => {
            throw new global.errs.HttpException('编辑评论失败');
        });
    }
    static async removeComment(id) {
        await Comment.destroy({
            where: {
                id
            }
        }).catch(err => {
            throw new global.errs.HttpException('删除评论失败');
        });
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
            offset: (page - 1) * size,
            raw: true
        });
        if (!data) return {};
        for (let item of data.rows) {
            const { id, userId } = item;
            const likeNum = await Like.count({
                where: { dynamicId: id }
            });
            const userInfo = await this.getUserInfo(userId);
            const comment = await Comment.scope('iv').findAndCountAll({
                where: {
                    dynamicId: id
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
            item.likeNum = likeNum;
            currentUserId && (item.isCurrentUser = currentUserId === item.userId);
            item.userInfo = userInfo;
            item.comment = {
                data: comment.rows,
                count: comment.count,
                totalPage: Math.ceil(comment.count / size)
            }
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