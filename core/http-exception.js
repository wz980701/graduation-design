class HttpException extends Error {
    constructor(msg = '服务器异常', errorCode = 10000, code = 400) {
        super();
        this.errorCode = errorCode;
        this.code = code;
        this.msg = msg;
    }
}

class AuthFailed extends HttpException {
    constructor(msg) {
        super();
        this.code = 401;
        this.msg = msg || '授权失败';
        this.errorCode = 10001;
    }
}

class NotFound extends HttpException {
    constructor(msg) {
        super();
        this.code = 404;
        this.msg = msg || '404找不到';
        this.errorCode = 10002;
    }
}

class Forbidden extends HttpException {
    constructor(msg) {
        super();
        this.code = 403;
        this.msg = msg || '禁止访问';
        this.errorCode = 10003;
    }
}

class Existing extends HttpException {
    constructor(msg) {
        super();
        this.code = 412;
        this.msg = msg || '已存在';
        this.errorCode = 10006;
    }
}

module.exports = {
    HttpException,
    AuthFailed,
    NotFound,
    Forbidden,
    Existing
};



