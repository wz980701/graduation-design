const Router = require('koa-router');
const got = require('got');
const jwt = require('jsonwebtoken');

const auth = require('../../middlewares/auth');

const { UserDao } = require('../dao/user');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/user'
});

const {
    wx,
    security
} = require('../../config/config');

const getOpenId = async (code) => {
    const { appId, appSecret } = wx;
    try {
        const result = await got.get(`https://api.weixin.qq.com/sns/jscode2session?appId=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`);
        return result.body;
    } catch (e) {
        throw new Error(e);
    }
}

router.post('/regist', async (ctx) => {
    const { code } = ctx.request.body;
    const data = await getOpenId(code);
    const { openid, session_key } = JSON.parse(data);
    await UserDao.create({
        openid
    });

    const { secret, expiresIn } = security;
    const token = jwt.sign({ userId: openid }, secret, { expiresIn });

    ctx.body = res.json({token, session_key}, '注册成功');
});

router.post('/message', async (ctx) => {
    await UserDao.addMessage(ctx.request.body);
    ctx.body = res.success('提交留言成功');
});

module.exports = router;