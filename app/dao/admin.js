const { Admin } = require('../models/admin');

class AdminDao {
    static async create(params) {
        const { username, password } = params;

        const hasAdmin = await Admin.findOne({
            where: {
                username
            }
        });

        if (hasAdmin) {
            throw new global.errs.Existing('管理员已存在');
        }

        const admin = new Admin();
        admin.username = username;
        admin.password = password;
        admin.save();

        return {
            username: admin.username,
            createdAt: admin.createTime
        }
    }
}

module.exports = {
    AdminDao
}