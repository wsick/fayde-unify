var optimist = require('optimist'),
    Promise = require('bluebird'),
    JsonFile = require('../../JsonFile'),
    logger = require('../../logger')();

function Bower(unify) {
    this.unify = unify;
}
Bower.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['local'])
        .parse(args || "");
    return this.run({
        options: {
            local: argv['local']
        }
    });
};
Bower.prototype.run = function (settings) {
    settings.options = settings.options || {};
    var bowerrc = new JsonFile('.bowerrc');
    return Promise.resolve(this)
        .tap(function () {
            if (bowerrc.exists)
                return bowerrc.load();
        })
        .tap(function () {
            return bowerrc
                .setValue('scripts/postinstall', settings.options.local ? '(npm bin)/unify update' : 'unify update')
                //.setValue('scripts/postuninstall', settings.local ? '(npm bin)/unify update' : 'unify update')
                .save();
        });
};

module.exports = Bower;