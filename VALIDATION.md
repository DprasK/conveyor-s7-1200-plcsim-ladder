# Status validasi — 3 September 2026

Proyek native dibuat dan diperiksa langsung di **TIA Portal V16**, dalam VM Windows. Target: **CPU 1214C DC/DC/DC**, `6ES7 214-1AG40-0XB0`, firmware **V4.4**.

| Pemeriksaan | Status |
|---|---|
| Unit test model scan PLC | 10 skenario lulus |
| Pemeriksaan source LAD | 4 pemeriksaan lulus; total `npm test` 14/14 |
| Konsistensi source LAD hasil generator | Lulus |
| Pemetaan 6 DI + 3 DQ unik | Lulus |
| Bahasa blok FB dan OB | LAD |
| Import tag, FB2, DB2 dan OB1 via Version Control Interface V16 | Berhasil untuk keempat file |
| Compile hardware dan software TIA Portal V16 | 0 error, 1 warning |
| Download ke S7-PLCSIM V16 | Berhasil; 0 error, 0 warning |
| Arsip native melalui Project > Archive | Berhasil; `.zap16` berisi `.ap16` dan database proyek |
| Uji I/O interaktif START/STOP/fault di PLCSIM | Belum selesai; tidak dinyatakan lulus |

Warning compile: **PLC_Conveyor does not contain a configured protection level**. Proteksi akses belum disetel untuk proyek latihan offline ini. Ini bukan izin penggunaan pada mesin produksi.

## Bukti aplikasi Siemens

- [Hasil compile TIA](docs/screenshots/tia-compile.png): OB1, FB2 dan DB2 berhasil di-compile.
- [Hasil download PLCSIM](docs/screenshots/plcsim-download.png): download selesai tanpa error; target sebelumnya dikonfirmasi sebagai **Simulated module**.
- [Editor LAD TIA](docs/screenshots/tia-ladder.png): kontak dan coil asli pada FB2.

SIM table sudah dicoba dibuat, tetapi respons UI VM sangat lambat dan pemeriksaan nilai I/O belum selesai. Tidak ada klaim bahwa seluruh skenario runtime PLCSIM atau timing TON sudah lolos. CPU terakhir yang teramati berada pada STOP; tidak ada force dibuat dan tidak ada download ke PLC fisik.

## Artefak

- Arsip: `project/Conveyor_LAD_V16.zap16`, 406836 byte.
- SHA-256: `5DDE7613BF376409352E36AD8078F2BD1D5517D67463E5DF5866D5FA198899C6`.
- Isi ZIP diperiksa: `Conveyor_LAD_V16.ap16`, `System/PEData.plf`, serta berkas pendukung proyek tersedia. Pengujian retrieve ulang di TIA belum dilakukan.

XML DB diperbaiki berdasarkan error importer V16; metadata read-only kini sesuai dan sudah berhasil diimpor. OB1 dibersihkan dari karakter patch yang tidak valid. Pencegahan restart dengan START ditahan ditambahkan dan lolos uji model.

Tes Node memeriksa perilaku logika dan konsistensi artefak, tetapi tidak menggantikan compiler Siemens atau pengujian hardware. Jalankan `npm test` dan `npm run check:lad` untuk mengulang pemeriksaan lokal.
