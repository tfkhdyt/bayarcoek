## bayarcoek encryptor
Sebuah script node.js untuk meng-encrypt source code project client kamu yang gak mau bayar. Terinspirasi oleh [SnowFag](https://github.com/py7hon)

<p align=center>
  <a href="https://facebook.com/tfkhdyt142"><img height="30" src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"></a>&nbsp;
  <a href="https://twitter.com/tfkhdyt"><img height="28" src="https://upload.wikimedia.org/wikipedia/en/6/60/Twitter_Logo_as_of_2021.svg"></a>&nbsp;
  <a href="https://instagram.com/_tfkhdyt_"><img height="30" src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"></a>&nbsp;
  <a href="https://youtube.com/tfkhdyt"><img height="30" src="https://upload.wikimedia.org/wikipedia/commons/a/a0/YouTube_social_red_circle_%282017%29.svg"></a>&nbsp;
  <a href="https://t.me/tfkhdyt"><img height="30" src="https://upload.wikimedia.org/wikipedia/commons/8/83/Telegram_2019_Logo.svg"></a>&nbsp;
  <a href="https://www.linkedin.com/mwlite/in/taufik-hidayat-6793aa200"><img height="30" src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg"></a>
  <a href="https://pddikti.kemdikbud.go.id/data_mahasiswa/QUUyNzdEMjktNDk0Ri00RTlDLUE4NzgtNkUwRDBDRjIxOUNB"><img height="30" src="https://i.postimg.cc/YSB2c3DG/1619598282440.png"></a>
  <a href="https://tfkhdyt.my.id/"><img height="31" src="https://www.svgrepo.com/show/295345/internet.svg"></a>&nbsp; <br>
  <a href="https://www.npmjs.com/package/bayarcoek"><img src="https://badge.fury.io/js/bayarcoek.svg" alt="NPM Version"/><a>
</p>

## Requirements
- Node.js
- NPM / Yarn

## Warning
Gunakan script ini dengan hati-hati.
Secara default, script ini akan meng-encrypt semua file dan folder di mana anda menjalankan command `bayarcoek` (Current Working Directory).
Jangan sampai kalian tanpa sengaja meng-encrypt seluruh storage kalian.
Saya tidak bertanggung jawab atas segala kesalahan yang terjadi karena kecerobohan user.

## Installation
1. Install package
  - Local
    - NPM 
      ```bash
      npm install bayarcoek --save-dev
      ```
    - Yarn
      ```bash
      yarn add bayarcoek --dev
      ```
  - Global (bisa dijalankan di mana saja, tapi tidak direkomendasikan karena sangat berisiko)
    - NPM 
      ```bash
      npm install -g bayarcoek
      ```
    - Yarn
      ```bash
      yarn global add bayarcoek
      ```

## Usage
1. Masuk ke folder project yang ingin di-encrypt
  ```bash
  cd path/to/project
  ```
2. Run command
  - Local
    - NPM 
      ```bash
      # encrypt
      npx bayarcoek encrypt

      # decrypt
      npx bayarcoek decrypt
      ```
    - Yarn
      ```bash
      # encrypt
      yarn run bayarcoek encrypt

      # decrypt
      yarn run bayarcoek decrypt
      ```
  - Global
    ```bash
    # encrypt
    bayarcoek encrypt

    # decrypt
    bayarcoek decrypt
    ```

## Advanced Usage
### Meng-encrypt satu file (atau lebih)
```bash
npx bayarcoek encrypt [nama_file_1] [nama_file_2] [dst]
```

### Mengubah extension
```bash
npx bayarcoek encrypt [nama_file] -x plongaplongo
# npx bayarcoek encrypt [nama_file] --extension plongaplongo
```

### Mengubah secret key
```bash
npx bayarcoek encrypt [nama_file] -k awokawokawok
# npx bayarcoek encrypt [nama_file] --secret-key awokawokawok
```

### Men-decrypt satu file (atau lebih)
```bash
npx bayarcoek decrypt [nama_file_1] [nama_file_2] [dst]
```

### Men-decrypt satu file dan timpa (file yang encrypted secara otomatis terhapus setelah di-decrypt)
```bash
npx bayarcoek decrypt [nama_file_1] -o
# npx bayarcoek decrypt [nama_file_1] --overwrite
```

### Menampilkan menu bantuan
```bash
npx bayarcoek -h
# npx bayarcoek --help
```

### Menampilkan nomor versi
```bash
npx bayarcoek -v
# npx bayarcoek --version
```

## Environment Variable
- `BAYARCOEK_KEY` = Secret key untuk enkripsi
- `BAYARCOEK_EXT` = Extension file hasil enkripsi

## Support
Klik tombol di bawah untuk mendukung saya lewat donasi

<p align="center">
  <a href="https://donate.tfkhdyt.my.id/">
    <img src="https://i.postimg.cc/jjRDbZQx/1621036430601.png" width="125px">
  </a>
</p>

## Informasi lebih lanjut
Apabila ada yang mau ditanyakan soal skrip ini, bisa langsung pm saya:
<p align=center>
<a href="https://linktr.ee/tfkhdyt" target="_blank"><img src="https://img.shields.io/badge/Contact-me-green?style=for-the-badge"/></a>
</p>
