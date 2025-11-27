const chalk = require("chalk");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const algorithm = "aes-256-ctr";

module.exports = (_path, secretKey, overwrite) => {
  let key = process.env.BAYARCOEK_KEY || secretKey;
  key = crypto
    .createHash("sha256")
    .update(String(key))
    .digest("base64")
    .substr(0, 32);

  const decrypt = async (file) => {
    let filehandle;
    let initVect;

    try {
      // Read the IV (first 16 bytes) asynchronously using fs.promises.open
      filehandle = await fs.promises.open(file, "r");
      initVect = Buffer.alloc(16);
      const readResult = await filehandle.read(initVect, 0, 16, 0);

      // Validate that we read exactly 16 bytes
      if (readResult.bytesRead !== 16) {
        throw new Error(
          `Failed to read IV: expected 16 bytes, but got ${readResult.bytesRead} bytes`
        );
      }
    } catch (err) {
      throw new Error(`Error reading IV from file: ${err.message}`);
    } finally {
      // Ensure file handle is closed
      if (filehandle) {
        await filehandle.close();
      }
    }

    // Read encrypted content starting from byte 16
    const readStream = fs.createReadStream(file, {
      start: 16,
    });
    const decipher = crypto.createDecipheriv(algorithm, key, initVect);
    const unzip = zlib.createUnzip();
    const writeStream = fs.createWriteStream(
      path.parse(file).dir + "/" + path.parse(file).name
    );
    readStream
      .pipe(decipher)
      .pipe(unzip)
      .on("error", () => {
        console.log("Nampaknya Anda menggunakan secret key yang salah");
        fs.unlink(path.parse(file).dir + "/" + path.parse(file).name, () => {});
        process.exit(1);
      })
      .pipe(writeStream);
    writeStream.on("finish", () => {
      if (overwrite) {
        fs.unlink(file, () => {});
      }
      console.log(
        `${chalk.green.bold(path.parse(file).base)} has been Decrypted!`
      );
    });
  };

  const main = (_path) => {
    const whitelist = ["bayarcoek.js", "node_modules"];
    let files;
    try {
      files = fs.statSync(_path);
    } catch (err) {
      console.log(
        `File/folder dengan nama ${path.parse(_path).base} tidak ditemukan!`
      );
      process.exit(1);
    }
    if (files.isFile()) {
      decrypt(_path).catch((err) => {
        console.error(`Error during decryption: ${err.message}`);
        process.exit(1);
      });
    } else {
      files = fs
        .readdirSync(_path)
        .filter(
          (file) => !/(^|\/)\.[^]/g.test(file) && !whitelist.includes(file)
        );
      files.forEach((file) => {
        const oldPath = path.join(_path, file);
        const newPath =
          path.parse(oldPath).dir + "/" + path.parse(oldPath).name;
        const item = fs.statSync(oldPath);
        if (item.isDirectory()) {
          fs.renameSync(oldPath, newPath);
          return main(newPath);
        }
        decrypt(oldPath).catch((err) => {
          console.error(`Error during decryption: ${err.message}`);
          process.exit(1);
        });
      });
    }
  };
  main(path.join(process.cwd(), _path));
};
