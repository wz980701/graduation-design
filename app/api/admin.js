const Router = require('koa-router');

const { AdminDao } = require('../dao/admin');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/admin'
});

router.get('/test', async (ctx) => {
    const admin = await AdminDao.create({
        username: 'mary',
        password: '123456'
    });

    ctx.body = res.json(admin);
});

module.exports = router;