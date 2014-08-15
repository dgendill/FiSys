define([], function() {
    'use strict';

    var that;

    var nstr = function(str) {
        return str.toLowerCase().trim();
    }

    var toArray = function(list) {
      return Array.prototype.slice.call(list || [], 0);
    }

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
        createDirectory : function(name, parentDir) {
            that._checkFs();

            var tree = name.split('/');
            var name = tree.shift();
            parentDir = parentDir || that.fs.root;

            console.log('Tryingto create directory ' + name);
            return new Promise(function(resolve, reject) {
                parentDir.getDirectory(name, {
                    create : true
                }, function(dirEntry) {
                    if (tree.length > 0) {
                        that.createDirectory(tree.join('/'), dirEntry).then(function(dirEntry) {
                            // Intermediate Case
                            resolve(dirEntry);
                        }, function(e) {
                            // Failure on Intermediate Case
                            reject(e);
                        });
                    } else {
                        // Base Case
                        resolve(dirEntry);
                    }
                }, function(e) {
                    reject(e);
                });
            });

        },
        getDirectory : function(name) {
            that._checkFs();

            return new Promise(function(resolve, reject) {
                that.fs.root.getDirectory(name, {}, function(dirEntry) {
                    resolve(dirEntry);
                }, function(e) {
                    that.createDirectory(name).then(function(dirEntry) {
                        resolve(dirEntry);
                    }, function(e) {
                        reject(e);
                    });
                });
            });
        },
        readDirectory : function(name) {
            that._checkFs();

            return new Promise(function(resolve, reject) {

                that.getDirectory(name).then(function(dirEntry) {
                    var dirReader = dirEntry.createReader();
                    var entries = [];

                    var readEntries = function() {
                        dirReader.readEntries(function(results) {
                            console.log(results);
                            if (!results.length) {
                                resolve(entries.sort());
                            } else {
                                entries = entries.concat(toArray(results));
                                readEntries();
                            }
                        });
                    };

                    readEntries();

                }, function(e) {
                    reject(e);
                });
            });


        },
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
        Names : function(entries) {
            return new Promise(function(resolve, reject) {
                resolve(entries.map(function(entry) {
                    return entry.name;
                }));
            });
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
