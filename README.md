# Conveyor sederhana — TIA Portal V16, LAD, S7-PLCSIM

Proyek latihan conveyor satu motor untuk **TIA Portal V16** dan **S7-PLCSIM V16**. Logika PLC dibuat sepenuhnya dalam **LAD (Ladder Diagram)**: START/STOP latch, permissive E-Stop dan overload, timer deteksi macet 5 detik, reset gangguan, serta lampu RUN/FAULT.

> Proyek edukasi, bukan program siap dipasang pada mesin. Baca [batas keselamatan](docs/SAFETY.md) sebelum menggunakan source.

## Buka proyek TIA langsung

Download **[Conveyor_LAD_V16.zap16](project/Conveyor_LAD_V16.zap16)**, lalu di TIA Portal V16 gunakan **Project > Open** dan pilih arsip untuk retrieve ke folder lokal. Buka `.ap16` hasil retrieve. CPU, tag, OB1, FB2 dan DB2 sudah tersedia di dalam proyek; tidak perlu impor XML untuk penggunaan biasa.

Arsip dibuat melalui **Project > Archive** di TIA V16. Compile hardware/software berhasil dengan **0 error, 1 warning** (proteksi akses CPU belum dikonfigurasi). Download ke **S7-PLCSIM** berhasil dengan **0 error, 0 warning**. Detail uji: [VALIDATION.md](VALIDATION.md).

## Fitur

- Siemens S7-1200 CPU 1214C DC/DC/DC sebagai target contoh.
- `Main [OB1]` LAD memanggil `FB_Conveyor_LAD [FB2]` dan `DB_Conveyor_LAD [DB2]`.
- 16 network Ladder yang dapat ditinjau di [daftar network](docs/LAD_NETWORKS.md), termasuk pencegahan restart jika START ditahan.
- 6 digital input dan 3 digital output; lihat [I/O list](docs/IO_List.csv).
- Arsip proyek native `.zap16` dan source XML yang sudah berhasil diimpor serta di-compile di TIA V16.
- Emulator browser lama tetap tersedia sebagai pelengkap; bukan pengganti S7-PLCSIM.
- 14 pemeriksaan otomatis: 10 skenario model scan dan 4 pemeriksaan source LAD.
- Workflow GitHub Actions untuk menjalankan validasi pada setiap push.

## Struktur proyek

```text
project/Conveyor_LAD_V16.zap16 Arsip proyek native TIA V16
source/                      XML alternatif untuk rebuild via VCI
  Conveyor_IO_LAD.xml       PLC tag table
  FB_Conveyor_LAD.xml       FB2, 16 network Ladder
  DB_Conveyor_LAD.xml       Instance DB2
  Main_LAD.xml              OB1 Ladder
emulator/                    Emulator visual di browser
tests/                       Test model scan dan source LAD
docs/UJI_PLCSIM.md           Langkah retrieve, download, dan uji PLCSIM
docs/screenshots/            Bukti pemeriksaan di aplikasi Siemens
tools/build-lad-xml.mjs      Generator deterministik source XML LAD
```

## Pelengkap: emulator browser

Karena browser membatasi modul JavaScript pada URL `file://`, jalankan web server lokal bawaan dari root repository:

```powershell
npm run serve
```

Lalu buka `http://127.0.0.1:4173/`. Server hanya memakai modul bawaan Node.js dan tidak mengunduh package.

Tekan **START**, tambahkan produk, lalu aktifkan **Simulasi macet**. Ketika produk menahan sensor selama 5 detik, fault akan latch dan motor berhenti. Nonaktifkan simulasi macet, tekan **Bersihkan sensor**, pulihkan permissive, tekan **RESET**, kemudian START kembali.

## Menjalankan pengujian

Node.js 18 atau lebih baru diperlukan; tidak ada dependency npm yang perlu diinstal.

```powershell
npm test
npm run check:lad
```

## Memakai di TIA Portal dan PLCSIM

Ikuti [panduan lengkap S7-PLCSIM](docs/UJI_PLCSIM.md). Ringkasnya: retrieve arsip `.zap16`, pilih `PLC_Conveyor`, klik **Start simulation**, kemudian download hanya ke target **Simulated module**. Jangan download ke PLC fisik sebelum desain listrik dan risiko mesin ditinjau teknisi yang kompeten.

## Pemetaan I/O

| Alamat | Tag | Fungsi saat TRUE |
|---|---|---|
| I0.0 | Conveyor_StartButton | Tombol START ditekan |
| I0.1 | Conveyor_StopOK | Rangkaian STOP sehat |
| I0.2 | Conveyor_EStopOK | Relay keselamatan eksternal sehat |
| I0.3 | Conveyor_OverloadOK | Overload motor sehat |
| I0.4 | Conveyor_JamSensor | Produk menghalangi sensor ujung |
| I0.5 | Conveyor_ResetButton | Tombol RESET ditekan |
| Q0.0 | Conveyor_MotorCmd | Perintah kontaktor motor |
| Q0.1 | Conveyor_RunLamp | Lampu hijau RUN |
| Q0.2 | Conveyor_FaultLamp | Lampu merah FAULT |

## Catatan validasi

Hasil dan batas pemeriksaan dicatat di [VALIDATION.md](VALIDATION.md). Model emulator mengikuti urutan network LAD dari atas ke bawah, termasuk latch, permissive, dan TON jam. Tetap lakukan compile TIA dan seluruh skenario PLCSIM karena test JavaScript bukan compiler Siemens.
