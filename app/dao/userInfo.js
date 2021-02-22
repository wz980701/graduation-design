const { UserInfo } = require('../models/userInfo');

class UserInfoDao {
    static async create(params) {
        const { userid, userInfo } = params;

        const hasUserInfo = await UserInfo.findOne({
            where: {
                userId: userid
            }
        });

        if (hasUserInfo) throw new global.errs.Existing('用户信息已存在');

        const userInfo = new UserInfo();
        userInfo.create({...userInfo, userId: userid});
        userInfo.save();

        return {
            userInfo
        }
    }
    static async update(params) {
        const { userid, userInfo } = params;

        await selectUserInfo.update(userInfo, {
            where: {
                userId: userid
            }
        });
    }
}

module.exports = {
    UserInfoDao
}