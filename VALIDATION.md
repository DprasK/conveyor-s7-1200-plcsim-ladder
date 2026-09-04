# Status validasi — diperbarui 4 September 2026

Proyek native dibuat dan diperiksa langsung di **TIA Portal V16**, dalam VM Windows. Target: **CPU 1214C DC/DC/DC**, `6ES7 214-1AG40-0XB0`, firmware **V4.4**.

| Pemeriksaan | Status |
|---|---|
| Pemeriksaan source LAD | 4 pemeriksaan lulus; total `npm test` 4/4 |
| Konsistensi source LAD hasil generator | Lulus |
| Pemetaan 6 DI + 3 DQ unik | Lulus |
| Bahasa blok FB dan OB | LAD |
| Import tag, FB2, DB2 dan OB1 via Version Control Interface V16 | Berhasil untuk keempat file |
| Compile hardware dan software TIA Portal V16 | 0 error, 1 warning |
| Download ke S7-PLCSIM V16 | Berhasil; 0 error, 0 warning |
| Force table input fisik | 6 input dikenali sebagai `%I0.0:P`–`%I0.5:P`; Force all berhasil aktif |
| Arsip native melalui Project > Archive | Berhasil; `.zap16` berisi `.ap16` dan database proyek |
| Uji I/O interaktif START/STOP/fault di PLCSIM | Belum selesai; tidak dinyatakan lulus |

Warning compile: **PLC_Conveyor does not contain a configured protection level**. Proteksi akses belum disetel untuk proyek latihan offline ini. Ini bukan izin penggunaan pada mesin produksi.

## Bukti aplikasi Siemens

- [Hasil compile TIA](docs/screenshots/tia-compile.png): OB1, FB2 dan DB2 berhasil di-compile.
- [Hasil download PLCSIM](docs/screenshots/plcsim-download.png): download selesai tanpa error; target sebelumnya dikonfirmasi sebagai **Simulated module**.
- [Editor LAD TIA](docs/screenshots/tia-ladder.png): kontak dan coil asli pada FB2.
- [Force table](docs/screenshots/tia-force-table.png): enam input dan kondisi awal aman tersedia di proyek.

Forcing keenam input berhasil diaktifkan pada PLCSIM dan kemudian dihentikan kembali. Pemeriksaan seluruh urutan START/STOP/fault dan timing TON belum selesai, sehingga tidak dinyatakan lulus. Tidak ada download ke PLC fisik.

## Artefak

- Arsip: `project/Conveyor_LAD_V16.zap16`, 408558 byte.
- SHA-256: `1F1194D570E3B1BF143033394C81149C3E8EEDB394FCAFDFE0C6D03DE1B94A17`.
- Isi ZIP diperiksa: `Conveyor_LAD_V16.ap16`, `System/PEData.plf`, serta berkas pendukung proyek tersedia. Pengujian retrieve ulang di TIA belum dilakukan.

XML DB diperbaiki berdasarkan error importer V16; metadata read-only kini sesuai dan sudah berhasil diimpor. OB1 dibersihkan dari karakter patch yang tidak valid. Pencegahan restart dengan START ditahan tersedia pada network 8 dan 16.

Tes Node hanya memeriksa struktur dan konsistensi artefak source; bukan simulator PLC dan tidak menggantikan compiler Siemens. Jalankan `npm test` dan `npm run check:lad` untuk mengulang pemeriksaan source.
