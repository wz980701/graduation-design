const { User } = require('../models/user');

class UserDao {
    static async create(params) {
        const { openid } = params;

        const hasUser = await User.findOne({
            where: {
                userid: openid
            }
        });

        if (!hasUser) {
            const user = new User();
            user.userid = openid;
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