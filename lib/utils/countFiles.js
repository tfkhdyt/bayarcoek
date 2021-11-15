const fs = require('fs');
const path = require('path');

module.exports = (_path, numberOfFiles) => {
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
      });
    }
    return numberOfFiles;
  };
  countFiles(_path);
};
