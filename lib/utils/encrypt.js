const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const zlib = require('zlib');

const algorithm = 'aes-256-ctr';
const AppendInitVect = require('./appendInitVect');

module.exports = (_path, extension, secretKey) => {
  let key = process.env.BAYARCOEK_KEY || secretKey;
  key = crypto
    .createHash('sha256')
    .update(String(key))
    .digest('base64')
    .substr(0, 32);

  const encrypt = async (file) => {
    const iv = crypto.randomBytes(16);
    const readStream = fs.createReadStream(file);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const appendInitVect = new AppendInitVect(iv);
    const writeStream = fs.createWriteStream(path.join(file + `.${extension}`));
    await readStream
      .pipe(gzip)
      .pipe(cipher)
      .pipe(appendInitVect)
      .pipe(writeStream);
    fs.unlink(file, () => {
      console.log(
        `${chalk.green.bold(path.parse(file).base)} has been Encrypted!`
      );
    });
  };

  const main = (_path, extension) => {
    const whitelist = ['bayarcoek.js', 'node_modules'];
    let files = fs.statSync(_path);
    if (files.isFile()) {
      encrypt(_path);
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
        // if (item.isDirectory()) main(newPath, extension);
      });
    }
  };
  main(process.cwd() + '/' + _path, extension);
};
