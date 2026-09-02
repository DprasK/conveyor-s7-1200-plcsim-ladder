# Conveyor sederhana Siemens S7-1200 — Ladder + PLCSIM

Proyek latihan conveyor satu motor untuk **TIA Portal V16** dan **S7-PLCSIM V16**. Logika PLC dibuat sepenuhnya dalam **LAD (Ladder Diagram)**: START/STOP latch, permissive E-Stop dan overload, timer deteksi macet 5 detik, reset gangguan, serta lampu RUN/FAULT.

> Proyek edukasi, bukan program siap dipasang pada mesin. Baca [batas keselamatan](docs/SAFETY.md) sebelum menggunakan source.

## Fitur

- Siemens S7-1200 CPU 1214C DC/DC/DC sebagai target contoh.
- `Main [OB1]` LAD memanggil `FB_Conveyor_LAD [FB2]` dan `DB_Conveyor_LAD [DB2]`.
- 15 network Ladder yang dapat ditinjau di [daftar network](docs/LAD_NETWORKS.md).
- 6 digital input dan 3 digital output; lihat [I/O list](docs/IO_List.csv).
- Source XML TIA V16 yang bisa diimpor, bukan screenshot atau pseudocode.
- Emulator visual browser tanpa instalasi library.
- Delapan unit test dan pemeriksaan konsistensi source LAD.
- Workflow GitHub Actions untuk menjalankan validasi pada setiap push.

## Struktur proyek

```text
source/                      XML impor TIA Portal V16
  Conveyor_IO_LAD.xml       PLC tag table
  FB_Conveyor_LAD.xml       FB2, 15 network Ladder
  DB_Conveyor_LAD.xml       Instance DB2
  Main_LAD.xml              OB1 Ladder
emulator/                    Emulator visual di browser
tests/                       Test model scan dan source LAD
docs/UJI_PLCSIM.md           Langkah import, download, dan uji PLCSIM
tools/build-lad-xml.mjs      Generator deterministik source XML LAD
```

## Mencoba emulator visual

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

Ikuti [panduan lengkap S7-PLCSIM](docs/UJI_PLCSIM.md). Ringkasnya: buat proyek baru, tambahkan CPU, impor tag table, FB, instance DB, dan OB1 secara berurutan, compile, lalu download ke PLCSIM. Jangan download ke PLC fisik sebelum desain listrik dan risiko mesin ditinjau teknisi yang kompeten.

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
