const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';

module.exports = (_path, secretKey) => {
  let key = process.env.BAYARCOEK_KEY || secretKey;
  key = crypto
    .createHash('sha256')
    .update(String(key))
    .digest('base64')
    .substr(0, 32);

  const decrypt = (encrypted) => {
    const iv = encrypted.slice(0, 16);
    encrypted = encrypted.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return result;
  };

  const main = (_path) => {
    const whitelist = ['bayarcoek.js', 'node_modules'];
    let files = fs.statSync(process.cwd() + '/' + _path);
    if (files.isFile()) {
      let oldPath, newPath;
      oldPath = `${process.cwd() + '/' + _path}`;
      newPath =
        path.parse(`${oldPath}`).dir + '/' + path.parse(`${oldPath}`).name;
      const plain = Buffer.from(fs.readFileSync(oldPath));
      let result = decrypt(plain);

      fs.writeFile(newPath, result, (err) => {
        if (err) return console.err(err);
        fs.unlink(oldPath, () => {
          console.log(
            `${chalk.green.bold(path.parse(`${oldPath}`).base)} has been Decrypted!`
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
        newPath = path.parse(`${oldPath}`).dir + '/' + path.parse(`${oldPath}`).name;
        const item = fs.statSync(oldPath);
        if (item.isDirectory()) {
          fs.renameSync(oldPath, newPath);
          return main(newPath);
        }
        const plain = Buffer.from(fs.readFileSync(oldPath));
        let result = decrypt(plain);
        fs.writeFile(newPath, result, (err) => {
          if (err) return console.err(err);
          fs.unlink(oldPath, () => {
            console.log(
              `${chalk.green.bold(path.parse(`${oldPath}`).base)} has been Decrypted!`
            );
          });
          if (item.isDirectory()) main(newPath);
        });
      });
    }
  };
  main(_path);
};
