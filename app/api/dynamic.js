const Router = require('koa-router');
const auth = require('../../middlewares/auth');
const fs = require('fs');
const OSS = require('ali-oss');

const { DynamicDao } = require('../dao/dynamic');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/dynamic'
});

const {
    region,
    accessKeyId,
    accessKeySecret,
    bucket
} = require('../../config/config').oss;

const client = new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket
});

router.post('/userRelease', auth, async (ctx) => { // 用户发布动态 已测试
    const result = await releaseFunc(ctx);
    await DynamicDao.release({ ...ctx.request.body, img: result.url, userId: ctx.state.userId});
    ctx.body = res.success('发布动态成功');
});

router.post('/communityRelease', auth, async (ctx) => { // 社团发布动态 已测试
    const result = await releaseFunc(ctx);
    await DynamicDao.release({ ...ctx.request.body, img: result.url, isCommunity: true, userId: ctx.state.userId });
    ctx.body = res.success('发布动态成功');
});

router.post('/edit', auth, async (ctx) => { // 编辑动态 已测试
    const result = await releaseFunc(ctx);
    await DynamicDao.edit({ ...ctx.request.body, img: result.url, userId: ctx.state.userId });
    ctx.body = res.success('编辑动态成功');
});

router.get('/delete', auth, async (ctx) => { // 删除动态 已测试
    const { dynamicId } = ctx.request.query;
    await DynamicDao.remove(dynamicId, ctx.state.userId);
    ctx.body = res.success('删除动态成功');
});

router.get('/detail', async (ctx) => { // 获取动态详情 已测试
    const { dynamicId } = ctx.request.query;
    const data = await DynamicDao.getDetail(dynamicId);
    ctx.body = res.json(data, '获取详情成功');
});

router.get('/like', auth, async (ctx) => { // 点赞动态 已测试
    const msg = await DynamicDao.like({...ctx.request.query,userId: ctx.state.userId});
    ctx.body = res.success(msg);
});

router.post('/addComment', auth, async (ctx) => { // 添加评论 已测试
    await DynamicDao.addComment({...ctx.request.body, userId: ctx.state.userId});
    ctx.body = res.success('评论成功');
});

router.post('/editComment', auth, async (ctx) => { // 编辑评论 已测试
    await DynamicDao.editComment({...ctx.request.body, userId: ctx.state.userId});
    ctx.body = res.success('编辑评论成功');
});

router.get('/removeComment', auth, async (ctx) => { // 删除评论 已测试
    const { id } = ctx.request.query;
    await DynamicDao.removeComment(id, ctx.state.userId);
    ctx.body = res.success('删除评论成功');
});

router.get('/userList', auth, async (ctx) => { // 获取用户动态列表 已测试
    const data = await DynamicDao.getUserList({...ctx.request.query, userId: ctx.state.userId});
    ctx.body = res.json(data, '获取动态列表成功');
});

router.get('/ownerList', auth, async (ctx) => { // 获取用户自身动态列表 已测试
    const data = await DynamicDao.getOwnerList({ ...ctx.request.query, userId: ctx.state.userId });
    ctx.body = res.json(data, '获取动态列表成功');
});

router.get('/communityList', auth, async (ctx) => { // 获取社团动态列表 已测试
    const data = await DynamicDao.getCommunityList({...ctx.request.query, userId: ctx.state.userId});
    ctx.body = res.json(data, '获取动态列表成功');
});

const releaseFunc = async (ctx) => {
    const img = ctx.request.files.file, path = img.path;
    const stream = fs.createReadStream(path);
    try {
        const result = await client.putStream(`/dynamic/${img.name}`, stream);
        fs.unlinkSync(path);
        return result;
    } catch (err) {
        console.log(err);
        fs.unlinkSync(path);
        throw new global.errs.HttpException('发布失败');
    }
}

module.exports = router;