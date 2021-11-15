const chalk = require('chalk');
const cliProgress = require('cli-progress');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const AppendInitVect = require('./appendInitVect');
const countFiles = require('./countFiles');
const algorithm = 'aes-256-ctr';

module.exports = (_path, extension, secretKey, numberOfFiles) => {
  let key = process.env.BAYARCOEK_KEY || secretKey;
  key = crypto
    .createHash('sha256')
    .update(String(key))
    .digest('base64')
    .substr(0, 32);

  const encrypt = (file) => {
    const iv = crypto.randomBytes(16);
    const readStream = fs.createReadStream(file);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const appendInitVect = new AppendInitVect(iv);
    const writeStream = fs.createWriteStream(path.join(file + `.${extension}`));
    readStream.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
    writeStream.on('finish', () => {
      fs.unlink(file, () => {
        console.log(
          `${chalk.green.bold(path.parse(file).base)} has been Encrypted!`
        );
      });
    });
  };

  const main = (_path, extension) => {
    numberOfFiles = countFiles(_path, numberOfFiles);
    const bar = new cliProgress.SingleBar(
      {
        stopOnComplete: true,
        clearOnComplete: true,
      },
      cliProgress.Presets.shades_classic
    );
    bar.start(numberOfFiles, 0);
    const whitelist = ['bayarcoek.js', 'node_modules'];
    let files = fs.statSync(_path);
    if (files.isFile()) {
      encrypt(_path);
      bar.increment();
    } else {
      files = fs
        .readdirSync(_path)
        .filter(
          (file) => !/(^|\/)\.[^]/g.test(file) && !whitelist.includes(file)
        );
      files.forEach((file) => {
        const oldPath = path.join(_path, file);
        const item = fs.statSync(oldPath);
        if (item.isDirectory()) {
          fs.renameSync(oldPath, oldPath + `.${extension}`);
          return main(oldPath + `.${extension}`, extension);
        }
        encrypt(oldPath);
        bar.increment();
      });
    }
    bar.stop();
  };
  main(path.join(process.cwd(), _path), extension);
};
