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

        if (hasUserInfo) throw new global.errs.Existing('用户信息已存在');

        const user = await User.findOne({
            where: {
                uId: userId
            }
        });

        if (!user) throw new global.errs.HttpException('用户不存在');

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
            console.log(err);
            throw new global.errs.HttpException('找不到该用户信息');
        });
    }
}

module.exports = {
    UserInfoDao
}