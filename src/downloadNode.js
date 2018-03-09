const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const tar = require('tar');

const NODE_DIR = '.node';
const DEFAULT_VERSION = '8.10.0';

const version = () => {
    try {
        return require(`${__dirname}/../../../package.json`)['lambda-node-runtime']['node-version'];
    } catch (error) {
        return DEFAULT_VERSION;
    }
};

const cleanNodeDir = dirPath => {
    fs.readdirSync(dirPath).forEach(file => {
        const curPath = path.join(dirPath, file);
        if (curPath == path.join(NODE_DIR, 'bin')) {
            return;
        }
        if (fs.lstatSync(curPath).isDirectory()) {
            cleanNodeDir(curPath);
        } else {
            fs.unlinkSync(curPath);
        }
    });
    if (dirPath === NODE_DIR) {
        return;
    }
    fs.rmdirSync(dirPath);
};

const downloadNode = (version) => (console.log(`Downloading Node.js ${version}...`), https.get(
    `https://nodejs.org/dist/v${version}/node-v${version}-linux-x64.tar.gz`,
    response => response
        .pipe((console.log('Unzipping...'), zlib.createGunzip()))
        .on('error', error => console.error('Error unzipping Node.js.', `Please check version '${version}' exists.`, error))
        .pipe((console.log('Extracting...'), tar.x({ cwd: NODE_DIR, strip: 1 })))
        .on('error', error => console.error('Error extracting Node.js', error))
        .on('close', () => (console.log('Cleaning...'), cleanNodeDir(NODE_DIR)))
).on('error', error => (console.error('Error downloading Node.js', error), process.exit(1))));

(fs.existsSync(NODE_DIR) || fs.mkdirSync(NODE_DIR), downloadNode(version()));
