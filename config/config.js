module.exports = {
    environment: 'dev',
    database: {
        dbName: 'community',
        host: '47.103.12.86',
        port: 3306,
        user: 'root',
        password: '138290Wz..0'
    },
    wx: {
        appId: 'wxff61119691f8a0d5',
        appSecret: '3bcefd71d32ca426f35c1e051d6d9a59',
        loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
    }
}