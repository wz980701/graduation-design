const Router = require('koa-router');
const auth = require('../../middlewares/auth');

const { CommunityDao } = require('../dao/community');
const { CommunityAnnounceDao } = require('../dao/communityAnnounce');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/community'
});

router.post('/create', auth, async (ctx) => { // 创建社团 已测试
    await CommunityDao.create({
        ...ctx.request.body,
        userId: ctx.state.userId,
        avatarUrl: 'https://graduation-jeremy.oss-cn-beijing.aliyuncs.com/default/头像.jfif',
        backgroundUrl: 'https://graduation-jeremy.oss-cn-beijing.aliyuncs.com/default/背景.jpg'
    });
    ctx.body = res.success('创建社团成功');
});

router.post('/update', auth, async (ctx) => { // 更新社团信息 已测试
    await CommunityDao.update({...ctx.request.body, userId: ctx.state.userId});
    ctx.body = res.success('更新社团信息成功');
});

router.get('/getInfo', async (ctx) => { // 获取社团基本信息 已测试
    const { communityId } = ctx.request.query;
    const data = await CommunityDao.getInfo(communityId);
    ctx.body = res.json(data, '获取社团基本信息成功');
});

router.get('/getUsers', async (ctx) => { // 获取社团成员列表 已测试
    const data = await CommunityDao.getUsers(ctx.request.query);
    ctx.body = res.json(data, '获取成员列表成功');
});

router.get('/getApplyList', async (ctx) => { // 获取申请加入列表 已测试
    const data = await CommunityDao.getApplyList(ctx.request.query);
    ctx.body = res.json(data, '获取申请列表成功');
});

router.get('/join', auth, async (ctx) => { // 用户申请加入社团 已测试
    await CommunityDao.join({...ctx.request.query, userId: ctx.state.userId});
    ctx.body = res.success('申请成功');
});

router.get('/passUser', auth, async (ctx) => { // 用户申请通过 已测试
    const { id } = ctx.request.query;
    await CommunityDao.pass(id, ctx.state.userId);
    ctx.body = res.success('审批成功');
});

router.get('/cancelApply', auth, async (ctx) => { // 取消申请
    await CommunityDao.cancelApply({...ctx.request.query, userId: ctx.state.userId});
    ctx.body = res.success('取消申请成功');
});

router.get('/addManager', auth, async (ctx) => { // 添加管理员 已测试
    const { id } = ctx.request.query;
    await CommunityDao.addManager(id, ctx.state.userId);
    ctx.body = res.success('添加管理员成功');
});

router.post('/addAnnounce', auth, async (ctx) => { // 发布公告 已测试
    await CommunityAnnounceDao.addAnnounce({...ctx.request.body, userId: ctx.state.userId});
    ctx.body = res.success('发布公告成功');
});

router.get('/getAnnounceList', auth, async (ctx) => { // 获取公告列表 已测试
    const data = await CommunityAnnounceDao.getAnnounceList({...ctx.request.query, userId: ctx.state.userId});
    ctx.body = res.json(data, '获取公告列表成功');
});

router.post('/updateAnnounce', auth, async (ctx) => { // 更新公告内容 已测试
    await CommunityAnnounceDao.updateAnnounce({...ctx.request.body, userId: ctx.state.userId});
    ctx.body = res.success('更新公告成功');
});

router.get('/deleteAnnounce', auth, async (ctx) => { // 删除公告 已测试
    const { id } = ctx.request.query;
    await CommunityAnnounceDao.deleteAnnounce(id, ctx.state.userId);
    ctx.body = res.success('删除公告成功');
});

router.get('/getCurrentUserLevel', auth, async (ctx) => { // 获取当前用户等级 已测试
    const { userId } = ctx.state, { communityId } = ctx.request.query;
    const data = await CommunityDao.getCurrentUserLevel(userId, communityId);
    ctx.body = res.json(data, '获取用户等级成功');
});

router.get('/removeUser', auth, async (ctx) => { // 删除用户或者用户退出社团 已测试
    const { communityId } = ctx.request.query;
    await CommunityDao.removeUser(communityId, ctx.state.userId);
    ctx.body = res.success('删除成功');
});

router.get('/userCommunityList', auth, async (ctx) => { // 用户获取加入的社团列表 已测试
    const data = await CommunityDao.getUserCommunityList({ ...ctx.request.query, userId: ctx.state.userId });
    ctx.body = res.json(data, '获取社团列表成功');
});

router.get('/allCommunityList', async (ctx) => { // 获取所有社团列表 已测试
    const data = await CommunityDao.getAllCommunityList(ctx.request.query);
    ctx.body = res.json(data, '获取社团列表成功');
});

router.post('/search', async (ctx) => { // 搜索社团 已测试
    const data = await CommunityDao.search(ctx.request.body);
    ctx.body = res.json(data, '获取搜索列表成功');
});

router.get('/getSelectCommunityList', auth, async (ctx) => { // 获取用户的社团列表 已测试
    const data = await CommunityDao.getSelectCommunityList({...ctx.request.query, userId: ctx.state.userId});
    ctx.body = res.json(data, '获取社团列表成功');
});

router.get('/getSearchUserList', async (ctx) => { // 获取搜索用户列表
    const data = await CommunityDao.getSearchUserList({ ...ctx.request.query });
    ctx.body = res.json(data, '获取搜索用户列表成功');
});

module.exports = router;

