const { Image } = require('../models/image');
const { Community } = require('../models/community');

class ImageDao {
    static async upload(url, name, communityId) {
        const community = await Community.findOne({
            where: {
                id: communityId
            }
        });
        if (!community) throw new global.errs.NotFound('没有找到相关社团');
        const image = await Image.create({ url, name });
        community.addImages(image);
    }
    static async remove(params) {
        const { imgIds } = params;
        await Image.destroy({
            where: {
                id: imgIds
            }
        }).catch(err => {
            throw new global.errs.HttpException('图片删除失败');
        });
        return await Image.findAll({
            attributes: ['name'],
            where: {
                id: imgIds
            }
        }) || [];
    }
    static async getList(params) {
        const { communityId, size = 10, page = 1 } = params;
        const list = await Image.scope('iv').findAndCountAll({
            where: {
                communityId
            },
            order: [
                ['create_time', 'DESC']
            ],
            limit: size,
            offset: (page - 1) * size
        });
        return {
            data: list.rows,
            count: list.count,
            totalPage: Math.ceil(list.count / size)
        }
    }
}

module.exports = {
    ImageDao
}