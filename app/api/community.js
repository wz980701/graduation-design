const Router = require('koa-router');

const { CommunityDao } = require('../dao/community');
const { CommunityAnnounceDao } = require('../dao/communityAnnounce');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/community'
});

router.post('/create', async (ctx) => { // 创建社团
    await CommunityDao.create(ctx.request.body);
    ctx.body = res.success('创建成功');
});

router.get('/get', async (ctx) => { // 获取社团基本信息
    const { communityId } = ctx.request.query;
    const data = await CommunityDao.get(communityId);
    ctx.body = res.json(data, '获取成功');
});

router.post('/getUsers', async (ctx) => { // 获取社团成员列表
    const data = await CommunityDao.getUsers(ctx.request.body);
    ctx.body = res.json(data, '获取成功');
});

router.post('/getApplyList', async (ctx) => { // 获取申请加入列表
    const data = await CommunityDao.getUsers(ctx.request.body);
    ctx.body = res.json(data, '获取成功');
});

router.post('/join', async (ctx) => { // 用户申请加入社团
    await CommunityDao.join(ctx.request.body);
    ctx.body = res.success('申请成功');
});

router.get('/pass', async (ctx) => { // 用户申请通过
    const { id } = ctx.request.query;
    await CommunityDao.pass(id);
    ctx.body = res.success('审批成功');
});

router.post('/addAnnounce', async (ctx) => { // 发布公告
    await CommunityAnnounceDao.addAnnounce(ctx.request.body);
    ctx.body = res.success('发布成功');
});

router.post('/getAnnounceList', async (ctx) => { // 获取公告列表
    const data = await CommunityAnnounceDao.getAnnounceList(ctx.request.body);
    ctx.body = res.json(data || {}, '获取列表成功');
});

module.exports = router;