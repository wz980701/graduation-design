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

    ctx.body = res.json(userInfo, '创建成功');
});

router.post('/update', async (ctx) => {
    const resq = ctx.request.body;
    const result = await UserInfoDao.update(resq);

    result.then(() => {
        ctx.body = res.success('更新成功');
    });
})

module.exports = router;

