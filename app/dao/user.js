const { User } = require('../models/user');

class UserDao {
    static async create(params) {
        const { openid } = params;

        const hasUser = await User.findOne({
            where: {
                uId: openid
            }
        });

        if (!hasUser) {
            await User.create({
                uId: openid
            });
        }

        return {
            userId: openid
        }
    }
}

module.exports = {
    UserDao
}