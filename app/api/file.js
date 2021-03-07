const Router = require('koa-router');
const fs = require('fs');
const OSS = require('ali-oss');

const { ImageDao } = require('../dao/image');
const { CommunityDao } = require('../dao/community');

const { Resolve } = require('../lib/helper');
const res = new Resolve();

const router = new Router({
    prefix: '/api/file'
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

router.post('/uploadImgs', async (ctx) => { // 上传图片
    const files = ctx.request.files;
    const { communityId } = ctx.request.body;
    for (let key in files) {
        const file = files[key], path = file.path;
        const stream = fs.createReadStream(path);
        try {
            const result = await client.putStream(`/community/${communityId}/${file.name}`, stream);
            await ImageDao.upload(result.url, result.name, communityId);
            fs.unlinkSync(path);
        } catch (err) {
            fs.unlinkSync(path);
            throw new global.errs.HttpException('上传失败');
        }
    }
    ctx.body = res.success('上传成功');
});

router.post('/removeImgs', async (ctx) => { // 删除图片
    const list = await ImageDao.remove(ctx.request.body);
    const arr = list.map(item => `/${item}`);
    arr.length > 0 && await client.deleteMulti(arr);
    ctx.body = res.success('删除图片成功');
});

router.get('/getImgs', async (ctx) => { // 获取图片列表
    const list = await ImageDao.getList(ctx.request.query);
    ctx.body = res.json(list, '获取图片列表成功');
});     

router.post('/setAvatarUrl', async (ctx) => {
    const file = ctx.request.files.file, path = file.path;
    const { communityId } = ctx.request.body;
    const stream = fs.createReadStream(path);
    try {
        const result = await client.putStream(`/avatarUrl/${file.name}`, stream);
        await CommunityDao.setAvatarUrl(result.url, communityId);
        fs.unlinkSync(path);
    } catch (err) {
        fs.unlinkSync(path);
        throw new global.errs.HttpException('上传失败');
    }
    ctx.body = res.success('上传成功');
});

router.post('/setBackgroundUrl', async (ctx) => {
    const file = ctx.request.files.file, path = file.path;
    const { communityId } = ctx.request.body;
    const stream = fs.createReadStream(path);
    try {
        const result = await client.putStream(`/backgroundUrl/${file.name}`, stream);
        await CommunityDao.setBackgroundUrl(result.url, communityId);
        fs.unlinkSync(path);
    } catch (err) {
        fs.unlinkSync(path);
        throw new global.errs.HttpException('上传失败');
    }
    ctx.body = res.success('上传成功');
});

module.exports = router;