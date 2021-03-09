const Koa = require('koa');
const InitManager = require('./core/init');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const path = require('path');

const catchError = require('./middlewares/exception');

const app = new Koa();

app.use(cors());
app.use(catchError);
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, 'tmp'),
        maxFileSize: 100 * 1024 * 1024,
        keepExtensions: true
    }
}));

InitManager.initCore(app);

app.listen(3000, () => {
    console.log('Koa is listening');
});

module.exports = app;

