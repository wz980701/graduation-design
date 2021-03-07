const Router = require('koa-router');

const { UserInfoDao } = require('../dao/userInfo');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/userInfo'
});

router.post('/create', async (ctx) => {
    const resq = ctx.request.body;
    const userInfo = await UserInfoDao.create(resq);

    ctx.body = res.json(userInfo, '创建用户信息成功');
});

router.post('/update', async (ctx) => {
    const resq = ctx.request.body;
    await UserInfoDao.update(resq);
    
    ctx.body = res.success('更新用户信息成功');
});

module.exports = router;

