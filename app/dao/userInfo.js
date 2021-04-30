const { UserInfo } = require('../models/userInfo');
const { User } = require('../models/user');

class UserInfoDao {
    static async create(params) {
        const { userId, ...userInfo } = params;

        const hasUserInfo = await UserInfo.findOne({
            where: {
                uId: userId
            }
        });

        if (hasUserInfo) {
            await this.update({userId, ...userInfo});
            return {
                userInfo
            }
        }

        const user = await User.findOne({
            where: {
                uId: userId
            }
        });

        if (!user) throw new global.errs.NotFound('用户不存在');

        const userInfoIns = await UserInfo.create({...userInfo, uId: userId})

        user.setUserInfo(userInfoIns);

        return {
            userInfo
        }
    }
    static async update(params) {
        const { userId, ...userInfo } = params;

        UserInfo.update({
            ...userInfo,
            updateTime: global.util.getCurrentTimeStamps()
        }, {
            where: {
                uId: userId
            }
        }).catch((err) => {
            throw new global.errs.HttpException('更新用户信息失败');
        });
    }
    static async get(userId) {
        const userInfo = await UserInfo.findOne({
            where: {
                uId: userId
            }
        });
        if (!userInfo) throw new global.errs.NotFound('找不到该用户信息');
        return userInfo;
    }
}

module.exports = {
    UserInfoDao
}