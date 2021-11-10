const fs = require('fs');

const extension = process.argv[2] || 'bayarcoek';
let count = 0;
const path = __dirname + '/';

const rename = (dir) => {
  let files = fs.readdirSync(dir);
  files = files.filter(
    (file) => !/(^|\/)\.[^\/\.]/g.test(file) && file != 'encrypt.js'
  );
  files.forEach((file) => {
    const oldPath = `${dir}/${file}`;
    const newPath = `${oldPath}.${extension}`;
    const item = fs.statSync(oldPath);
    try {
      fs.renameSync(oldPath, newPath);
      console.log(
        `${++count}. ${oldPath.replace(path, '')} => ${newPath.replace(
          path,
          ''
        )} (SUCCESS)`
      );
    } catch {
      console.log(
        `${++count}. ${oldPath.replace(path, '')} => ${newPath.replace(
          path,
          ''
        )} (ERROR)`
      );
    }
    if (item.isDirectory()) rename(newPath);
  });
};

rename(__dirname);
