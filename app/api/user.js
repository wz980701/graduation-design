const Router = require('koa-router');
const got = require('got');

const { UserDao } = require('../dao/user');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/user'
});

const {
    appId,
    appSecret
} = require('../../config/config').wx;

const getOpenId = async (code) => {
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
    const user = await UserDao.create({
        openid
    });

    ctx.body = res.json({...user, session_key}, '注册成功');
});

module.exports = router;