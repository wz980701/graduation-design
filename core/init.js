const Router = require('koa-router');
const requireDirectory = require('require-directory');

class InitManager {
    static initCore (app) {
        InitManager.app = app;
        InitManager.initLoadRouters();
        InitManager.loadHttpException();
        InitManager.loadConfig();
        InitManager.loadUtil();
    }

    static initLoadRouters() {
        const apiDirectory = `${process.cwd()}/app/api`;
        requireDirectory(module, apiDirectory, {
            visit: whenLoadModule
        });

        function whenLoadModule(obj) {
            if (obj instanceof Router) {
                InitManager.app.use(obj.routes());
            }
        }
    }

    static loadConfig(path = '') {
        const configPath = path || `${process.cwd()}/config/config.js`;
        const config = require(configPath);
        global.config = config;
    }

    static loadUtil(path = '') {
        const utilPath = path || `${process.cwd()}/util/util.js`;
        const util = require(utilPath);
        global.util = util;
    }

    static loadHttpException() {
        const errors = require('./http-exception');
        global.errs = errors;
    }
}

module.exports = InitManager;