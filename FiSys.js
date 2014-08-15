define([], function() {
    'use strict';

    var that;

    var nstr = function(str) {
        return str.toLowerCase().trim();
    };

    function FiSys(type) {
        that = this;
        type = type || PERSISTENT;

        this.rfs = window.requestFileSystem || webkitRequestFileSystem;

        if (type === PERSISTENT || nstr(type) === "persistent") { this.type = PERSISTENT;
            this.type = PERSISTENT;
            this.storage = navigator.webkitPersistentStorage;
        } else if (type === TEMPORARY || nstr(type) === "temporary") {
            this.type = TEMPORARY;
            this.storage = navigator.webkitTemporaryStorage;
        } else if (type !== null) {
            throw new Error('FiSys type must be "persistent" or "temporary".');
        }
    }

    FiSys.prototype = {
        getFile : function(name) {
            that._checkFs();

            return new Promise(function(resolve, reject) {

                that.fs.root.getFile(name, {}, function(fileEntry) {
                    resolve(fileEntry);
                }, function(e) {
                    that.createFile(name).then(function(fileEntry) {
                        resolve(fileEntry);
                    }, function(e) {
                        reject(e);
                    });
                });
            });
        },
        createFile : function(name) {
            that._checkFs();

            return new Promise(function(resolve, reject) { that.fs.root.getFile(name, {
                    create: true,
                    exclusive: true
                }, function(fileEntry) {
                    resolve(fileEntry);
                }, function (e) {
                    reject(e);
                });
            });
        },
        request : function(size) {
            return this._requestAccess(size);
        },
        _checkFs : function() {
            if (!this.fs) throw new Error("File System does not exist.");
        },
        _requestFileSystem : function(size) {
            return new Promise(function(resolve, reject) {
                window.requestFileSystem(that.type, size, function(fs) {
                    that.fs = fs;
                    resolve(that);
                }, function(e) {
                    console.log(e);
                    reject(e);
                });
            });
        },
        _requestAccess : function(size) {
            return new Promise(function(resolve, reject) {
                that.storage.requestQuota(size, function(grantedBytes) {
                    that._requestFileSystem(size).then(function(fs) {
                        resolve(fs);
                    });
                }, function(e) {
                    reject(e);
                });
            });
        }
    };

    return FiSys;
});
