#!/usr/bin/env node
// modules
const { Command } = require('commander');
const program = new Command();

// imported files
const info = require('../package.json');
const encrypt = require('../lib/utils/encrypt');
const decrypt = require('../lib/utils/decrypt');

// program information
program
  .name('bayarcoek')
  .usage('<command> [options]')
  .version(info.version, '-v, --version', 'Menampilkan versi')
  .showSuggestionAfterError()
  .helpOption('-h, --help', 'Menampilkan bantuan');

// command
// encrypt
program
  .command('encrypt [path...]')
  .description('Mengenkripsi file atau folder')
  .option(
    '-x, --extension <ext>',
    'Pilih custom extension untuk hasil enkripsi',
    'bayarcoek'
  )
  .option(
    '-k, --secret-key <key>',
    'Secret key untuk enkripsi dan dekripsi',
    'N7wKWb5434FLD'
  )
  .action((path, options) => {
    // encrypt(path);
    if (path.length == 0) path.push('');
    const numberOfFiles = path.length;
    path.forEach((p) => {
      encrypt(p, options.extension, options.secretKey, numberOfFiles);
    });
  });

// decrypt
program
  .command('decrypt [path...]')
  .description('Mendekripsi file atau folder')
  .option(
    '-k, --secret-key <key>',
    'Secret key untuk enkripsi dan dekripsi',
    'N7wKWb5434FLD'
  )
  .option('-o, --overwrite', 'Timpa file hasil decrypt')
  .action((path, options) => {
    if (path.length == 0) path.push('');
    const numberOfFiles = path.length;
    path.forEach((p) => {
      decrypt(p, options.secretKey, options.overwrite, numberOfFiles);
    });
  });

// option
program.parse();
