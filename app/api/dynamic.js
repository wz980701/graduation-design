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

router.post('/userRelease', async (ctx) => { // 用户发布动态
    const result = await releaseFunc(ctx);
    await DynamicDao.release({ ...ctx.request.body, img: result.url});
    ctx.body = res.success('发布成功');
});

router.post('/communityRelease', async (ctx) => { // 社团发布动态
    const result = await releaseFunc(ctx);
    await DynamicDao.release({ ...ctx.request.body, img: result.url, isCommunity: true });
    ctx.body = res.success('发布成功');
});

router.post('/edit', async (ctx) => { // 编辑动态
    const result = await releaseFunc(ctx);
    await DynamicDao.edit({ ...ctx.request.body, img: result.url });
    ctx.body = res.success('编辑动态成功');
});

router.get('/delete', async (ctx) => { // 删除动态
    const { dynamicId } = ctx.request.query;
    await DynamicDao.remove(dynamicId);
    ctx.body = res.success('删除动态成功');
})

router.get('/detail', async (ctx) => { // 获取动态详情
    const { id } = ctx.request.query;
    const data = await DynamicDao.getDetail(id);
    ctx.body = res.json(data, '获取详情成功');
});

router.post('/like', async (ctx) => { // 点赞动态
    await DynamicDao.like(ctx.request.body);
    ctx.body = res.success('点赞成功');
});

router.post('/addComment', async (ctx) => { // 添加评论
    await DynamicDao.addComment(ctx.request.body);
    ctx.body = res.success('评论成功');
});

router.post('/editComment', async (ctx) => { // 编辑评论
    await DynamicDao.editComment(ctx.request.body);
    ctx.body = res.success('编辑评论成功');
});

router.get('/removeComment', async (ctx) => { // 删除评论
    const { id } = ctx.request.query;
    await DynamicDao.removeComment(id);
    ctx.body = res.success('删除评论成功');
});

router.get('/userList', async (ctx) => { // 获取用户动态列表
    const data = await DynamicDao.getUserList(ctx.request.query);
    ctx.body = res.json(data, '获取列表成功');
});

router.get('/communityList', async (ctx) => { // 获取社团动态列表
    const data = await DynamicDao.getCommunityList();
    ctx.body = res.json(data, '获取列表成功');
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