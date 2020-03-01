'use strict';

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const commandLineUsage = require('command-line-usage');

const argv = require('minimist')(process.argv.slice(2));

const usageSections = [
    {
        header: 'quick-proxy',
        content: 'Create simple proxy server with particular routes handled on localhost'
    },
    {
        header: 'Synopsis',
        content: `$ quick-api [{bold -h}] {underline config-file}`
    }
]
const usage = commandLineUsage(usageSections);

const { _: args, h: help } = argv;

if (args.length == 0) {
    console.log(usage);
    process.exit(0);
}

if (typeof help == 'boolean' && help) {
    console.log(usage);
    process.exit(0);
}

const config = require(args[0]);

if (typeof config.port != 'number') {
    console.error('Specify "port" in config file');
    process.exit(0);
}

const app = express();

app.use(morgan('dev'));

// ---------- handle ----------
Array.isArray(config.handle) && config.handle.forEach(route => {
    app[route.method.toLowerCase()](route.url, (_, res) => {
        route.status && res.status(route.status);
        route.body ? res.json(route.body) : res.end();
    });
});
 
app.use('/', createProxyMiddleware({ target: config.proxy, changeOrigin: true }));

app.listen(config.port, () => {
    console.log(`listening on http://localhost:${config.port}`);
});
