const { User } = require('../models/user');

class UserDao {
    static async create(params) {
        const { openid } = params;

        const hasUser = await User.findOne({
            where: {
                userId: openid
            }
        });

        if (!hasUser) {
            const user = new User();
            user.userId = openid;
            user.save();
        }

        return {
            userid: openid
        }
    }
}

module.exports = {
    UserDao
}