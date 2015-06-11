#!/usr/bin/env node

var migrate = require('./lib/migrate');

migrate('http://www.hr6r.com/feeds/posts/default?alt=json&max-results=1', './');
