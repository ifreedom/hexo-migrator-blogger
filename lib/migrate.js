var url = require('url'),
    async = require('async'),
    moment = require('moment'),
    request = require('request'),
    fs = require('fs'),
    tomd = require('to-markdown');

module.exports = function(source, target) {
    var uri = url.parse(source);
    if (uri.protocol == "file:") {
        console.log('Reading...');
        transform(fs.readFileSync(uri.pathname), target);
    } else {
        console.log('Fetching...');
        request(source, function(err, res, body) {
            if (err) throw err;
            transform(body, target);
        });
    }
};

function prop(attr) {
    return function(k) {
        return k[attr];
    };
}

function transform(feedcontent, target) {
    var posts = JSON.parse(feedcontent).feed.entry;

    async.eachOf(posts.reverse(), function(item, idx, cb) {
        var title = item.title['$t'];
        var file = 'blogger-' + idx;
        var published = item.published['$t'];
        var tags = '';
        if (item.category) {
            tags = item.category.map(prop('term'));
        }
        var header = [
            'title: |',
            '\t' +  title,
            'date: ' + moment(published).format('YYYY-MM-DD HH:mm:ss'),
            'tags: [' + tags + ']',
            '---',
        ];
        var content = item.content['$t'];
        fs.writeFile(target + file + '.md', header.join('\n') + '\n\n' + tomd(content), cb);
    }, function(err) {
        if (err) throw err;
        console.log('%d posts migrated.', posts.length);
    });
}
