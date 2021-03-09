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
                    ctx.state.userId = res.userId;
                } catch (err) {
                    throw new global.errs.AuthFailed('token验证失败');
                }
                await next();
            }
        }
    } else {
        throw new global.errs.AuthFailed('需要携带token值');
    }
}

