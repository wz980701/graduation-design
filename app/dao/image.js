const { Image } = require('../models/image');
const { Community } = require('../models/community');

class ImageDao {
    static async upload(url, communityId) {
        const community = await Community.findOne({
            where: {
                id: communityId
            }
        });
        const image = await Image.create({ url });
        community.addImages(image);
    }
}

module.exports = {
    ImageDao
}