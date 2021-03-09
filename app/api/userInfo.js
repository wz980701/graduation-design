const Router = require('koa-router');
const auth = require('../../middlewares/auth');

const { UserInfoDao } = require('../dao/userInfo');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/userInfo'
});

router.post('/create', auth, async (ctx) => {
    const userInfo = await UserInfoDao.create({...ctx.request.body, userId: ctx.state.userId});
    ctx.body = res.json(userInfo, '创建用户信息成功');
});

router.post('/update', auth, async (ctx) => {
    await UserInfoDao.update({...ctx.request.body, userId: ctx.state.userId});    
    ctx.body = res.success('更新用户信息成功');
});

module.exports = router;

