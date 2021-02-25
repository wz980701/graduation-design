const moment = require('moment');

const getCurrentTimeStamps = () => {
    return moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss');
}

module.exports = {
    getCurrentTimeStamps
}