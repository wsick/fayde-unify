var logger = require('../logger');

function transcribe(libs, clients) {
    function transcribeSingle(lib) {
        var name = lib.unify.getValue('name') || lib.name;
        logger.info('Updated records for ' + name);

        var dist = lib.unify.getValue('dist') || undefined;
        if (dist && isDefaultLibPath(name, dist))
            dist = undefined;

        var exports = lib.unify.getValue('library/exports') || undefined;

        var themes = lib.unify.getValue('themes') || undefined;
        if (themes) {
            themes = JSON.parse(JSON.stringify(themes));
        }

        var deps = (lib.bowerDeps || []).map(function (dep) {
            return dep.unify.getValue('name') || dep.name;
        });
        if (deps.length <= 0)
            deps = undefined;

        clients.setValue('libs/' + name + '/exports', exports)
            .setPathValue('libs/' + name + '/path', dist, lib.name)
            .setValue('libs/' + name + '/deps', deps)
            .setValue('themes/' + name, {})
            .fallback('libs/' + name, {})
            .fallback('themes/' + name, {});
    }

    (libs || []).forEach(transcribeSingle);
}

function isDefaultLibPath(name, dist) {
    var dist = normalize(dist);
    var expected = normalize(path.join('dist', name));
    logger.debug('isDefault: ' + dist + ' === ' + expected);
    return (dist === expected)
        || (dist === expected + '.js');
}

function normalize(relpath) {
    return path.normalize(relpath).replace(/\\/g, '/');
}

module.exports = transcribe;