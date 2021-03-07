const { User } = require('../models/user');
const { Message } = require('../models/message');

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
    static async addMessage(params) {
        const { content } = params;
        await Message.create({ content }).catch(err => {
            throw new global.errs.HttpException('创建留言失败');
        });
    }
}

module.exports = {
    UserDao
}