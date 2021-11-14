const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const zlib = require('zlib');
const cliProgress = require('cli-progress');

const algorithm = 'aes-256-ctr';

module.exports = (_path, secretKey, overwrite, numberOfFiles) => {
  let key = process.env.BAYARCOEK_KEY || secretKey;
  key = crypto
    .createHash('sha256')
    .update(String(key))
    .digest('base64')
    .substr(0, 32);
    
  const countFiles = (_path) => {
    const whitelist = ['bayarcoek.js', 'node_modules'];
    let files = fs.statSync(_path);
    if (files.isDirectory()) {
      files = fs
        .readdirSync(_path)
        .filter(
          (file) => !/(^|\/)\.[^]/g.test(file) && !whitelist.includes(file)
        );
      files.forEach((file) => {
        const oldPath = path.join(_path, file);
        const item = fs.statSync(oldPath);
        if (item.isDirectory()) {
          return countFiles(oldPath);
        }
        numberOfFiles++;
        // if (item.isDirectory()) main(newPath, extension);
      });
    }
    return numberOfFiles;
  };

  const decrypt = (file) => {
    const readInitVect = fs.createReadStream(file, {
      end: 15,
    });

    let initVect;
    readInitVect.on('data', (chunk) => {
      initVect = chunk;
    });

    readInitVect.on('close', async () => {
      const readStream = fs.createReadStream(file, {
        start: 16,
      });
      const decipher = crypto.createDecipheriv(algorithm, key, initVect);
      const unzip = zlib.createUnzip();
      const writeStream = fs.createWriteStream(
        path.parse(file).dir + '/' + path.parse(file).name
      );
      await readStream.pipe(decipher).pipe(unzip).pipe(writeStream);
      if (overwrite) {
        fs.unlink(file, () => {});
      }
      console.log(
        `${chalk.green.bold(path.parse(file).base)} has been Decrypted!`
      );
    });
  };

  const main = (_path) => {
    numberOfFiles = countFiles(_path);
    const bar = new cliProgress.SingleBar({
      stopOnComplete: true,
      clearOnComplete: true
    }, cliProgress.Presets.shades_classic);
    bar.start(numberOfFiles, 0);
    const whitelist = ['bayarcoek.js', 'node_modules'];
    let files = fs.statSync(_path);
    if (files.isFile()) {
      decrypt(_path);
      bar.increment();
    } else {
      files = fs
        .readdirSync(_path)
        .filter(
          (file) => !/(^|\/)\.[^]/g.test(file) && !whitelist.includes(file)
        );
      files.forEach((file) => {
        let oldPath, newPath;
        // const x = _path == '' ? '/' : `/${_path}/`;
        oldPath = path.join(_path, file);
        newPath = path.parse(oldPath).dir + '/' + path.parse(oldPath).name;
        const item = fs.statSync(oldPath);
        if (item.isDirectory()) {
          fs.renameSync(oldPath, newPath);
          return main(newPath);
        }
        decrypt(oldPath);
        bar.increment();
      });
    }
    bar.stop();
  };
  main(path.join(process.cwd(), _path));
};
