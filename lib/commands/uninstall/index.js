var optimist = require('optimist'),
    bower = require('bower'),
    Promise = require('bluebird'),
    Library = require('../../Library');

function Uninstall(renderer, unify) {
    this.renderer = renderer;
    this.unify = unify;
    this.mylib = new Library(this.unify, this.renderer);
}
Uninstall.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['save', 'save-dev'])
        .parse(args || "");
    return this.run({
        libs: argv._,
        options: {
            save: argv['save'],
            saveDev: argv['save-dev']
        }
    });
};
Uninstall.prototype.run = function (settings) {
    return Promise.resolve(this)
        .tap(function (uninstall) {
            return uninstall.unify.load();
        })
        .tap(this._loadClientFile.bind(this))
        .tap(this._uninstallFromClient.bind(this, settings.libs))
        .tap(this._bowerUninstall.bind(this, settings.libs, settings.options))
        .tap(function (install) {
            return install.mylib.save();
        });
};
Uninstall.prototype._bowerUninstall = function (libs, options) {
    options = {
        save: options.save === true,
        saveDev: options.saveDev === true
    };
    if (!libs || libs.length <= 0) {
        libs = undefined;
        options = undefined;
    }
    var _this = this;
    return new Promise(function (resolve, reject) {
        bower.commands
            .uninstall(libs, options)
            .on('data', function (data) {
                data && _this.renderer.log(data);
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('end', function (installed) {
                resolve(installed);
            });
    });
};
Uninstall.prototype._loadClientFile = function () {
    this.renderer.debug('Ensuring current library.');
    return this.mylib.ensure();
};
Uninstall.prototype._uninstallFromClient = function (libs) {
    return this.mylib.uninstall(libs);
};

module.exports = Uninstall;