const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';

module.exports = (_path, extension, secretKey) => {
  let key = process.env.BAYARCOEK_KEY || secretKey;
  key = crypto
    .createHash('sha256')
    .update(String(key))
    .digest('base64')
    .substr(0, 32);

  const encrypt = (buffer) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result;
  };

  const main = (_path, extension) => {
    const whitelist = ['bayarcoek.js', 'node_modules'];
    let files = fs.statSync(process.cwd() + '/' + _path);
    if (files.isFile()) {
      let oldPath, newPath;
      oldPath = `${process.cwd() + '/' + _path}`;
      newPath = `${oldPath}.${extension}`;
      const plain = Buffer.from(fs.readFileSync(oldPath));
      let result = encrypt(plain);

      fs.writeFile(newPath, result, (err) => {
        if (err) return console.err(err);
        fs.unlink(oldPath, () => {
          console.log(
            `${chalk.green.bold(path.parse(`${oldPath}`).base)} has been Encrypted!`
          );
        });
      });
    } else {
      files = fs
        .readdirSync(process.cwd() + '/' + _path)
        .filter(
          (file) => !/(^|\/)\.[^]/g.test(file) && !whitelist.includes(file)
        );
      files.forEach((file) => {
        let oldPath, newPath;
        const x = (_path == '') ? '/' : `/${_path}/`;
        oldPath = `${process.cwd() + x + file}`;
        newPath = `${oldPath}.${extension}`;
        const item = fs.statSync(oldPath);
        if (item.isDirectory()) {
          fs.renameSync(oldPath, newPath);
          return main(newPath, extension);
        }
        const plain = Buffer.from(fs.readFileSync(oldPath));
        let result = encrypt(plain);
        fs.writeFile(newPath, result, (err) => {
          if (err) return console.err(err);
          fs.unlink(oldPath, () => {
            console.log(
              `${chalk.green.bold(path.parse(`${oldPath}`).base)} has been Encrypted!`
            );
          });
          if (item.isDirectory()) main(newPath, extension);
        });
      });
    }
  };
  main(_path, extension);
};
