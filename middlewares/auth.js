const jwt = require('jsonwebtoken');

const { secret } = require('../config/config').security;

module.exports = async (ctx, next) => {
    if (ctx.header && ctx.header.authorization) {
        const parts = ctx.header.authorization.split(' ');
        if (parts.length === 2) {
            const scheme = parts[0];
            const token = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                try {
                    const res = jwt.verify(token, secret);
                    ctx.state.userId = res.openid;
                    await next();
                } catch (err) {
                    throw new global.errs.AuthFailed('token验证失败');
                }
            }
        }
    }
}

