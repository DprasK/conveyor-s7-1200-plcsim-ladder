# Uji dengan Siemens S7-PLCSIM

Panduan ini memakai TIA Portal V16 dan S7-PLCSIM V16. Lakukan hanya pada simulator yang tidak terhubung ke mesin.

## 1. Buka arsip proyek (cara utama)

1. Download `project/Conveyor_LAD_V16.zap16` dari repository.
2. Di TIA Portal V16, pilih **Project > Open**, lalu pilih arsip `.zap16`. TIA akan menawarkan proses retrieve.
3. Pilih folder lokal untuk hasil retrieve. Buka file `.ap16` hasilnya.
4. Proyek sudah berisi CPU, PLC tags, OB1 LAD, FB2 LAD dan instance DB2. Tidak perlu membuat ulang blok atau memakai SCL.
5. Pilih `PLC_Conveyor`, kemudian **Compile > Hardware and software (only changes)**.

## Alternatif: membangun ulang dari XML

1. Buat project baru dan tambahkan CPU **S7-1200 CPU 1214C DC/DC/DC**, contoh order number `6ES7 214-1AG40-0XB0`, firmware yang tersedia di katalog V4.4.
2. Pastikan alamat digital input dimulai di `%I0.0` dan digital output di `%Q0.0`.
3. Di **Version control interface**, pilih **Add new workspace**. Atur workspace path ke folder `source` melalui tombol konfigurasi workspace. Pilih **Show all objects**.
4. Drag `Conveyor_IO_LAD.xml` dari panel workspace ke **PLC tags** pada panel Project. Tunggu dialog import sukses.
5. Drag file berikut dari workspace ke **Program blocks**, berurutan:
   - `source/FB_Conveyor_LAD.xml`
   - `source/DB_Conveyor_LAD.xml`
   - `source/Main_LAD.xml`; pilih overwrite hanya untuk `Main [OB1]` kosong pada proyek baru
6. Jalankan **Compile > Hardware and software (only changes)**. Jangan lanjut jika masih ada error.

Alur Version Control Interface ini telah digunakan untuk import ke TIA V16. XML blok bukan external source SCL; jangan dimasukkan lewat **External source files**.

## 2. Menjalankan PLCSIM

1. Klik **Start simulation**. Jika diminta, aktifkan **Support simulation during block compilation**. Pastikan target download bertuliskan **Simulated module**, kemudian load ke PLCSIM.
2. Ubah CPU PLCSIM ke **RUN**.
3. Buat SIM table berisi alamat `%I0.0`–`%I0.5` dan `%Q0.0`–`%Q0.2`.
4. Set kondisi sehat awal: `%I0.1=1`, `%I0.2=1`, `%I0.3=1`, `%I0.4=0`. Input lain 0.

Alternatif yang sudah disiapkan di dalam proyek: buka **Watch and force tables > Force table**. Keenam input sudah tercantum sebagai peripheral input `%I0.0:P`–`%I0.5:P`. Klik **Force all** dan konfirmasi hanya ketika target benar-benar PLCSIM. Ubah kolom **Force value**, bukan deklarasi parameter di FB. Hentikan forcing setelah pengujian.

## 3. Skenario penerimaan

| Uji | Urutan input | Hasil yang diharapkan |
|---|---|---|
| Startup aman | Kondisi sehat, CPU RUN | Q0.0=0, Q0.1=0, Q0.2=0 |
| Start/hold | Pulse I0.0=1 lalu 0 | Q0.0=1 dan Q0.1=1 tetap ON |
| Stop | Saat berjalan, set I0.1=0 lalu 1 | Q0.0/Q0.1 OFF; Q0.2 tetap OFF |
| E-Stop | Saat berjalan, set I0.2=0 | Motor OFF dan Q0.2 ON/latch |
| Overload | Saat berjalan, set I0.3=0 | Motor OFF dan Q0.2 ON/latch |
| Jam sementara | Saat berjalan, I0.4=1 kurang dari 5 s lalu 0 | Conveyor tetap berjalan, tidak fault |
| Jam nyata | Saat berjalan, I0.4=1 minimal 5 s | Motor OFF dan Q0.2 ON/latch |
| Reset ditolak | Fault aktif, penyebab masih ada, pulse I0.5 | Q0.2 tetap ON |
| Reset diterima | Pulihkan input sehat, I0.4=0, pulse I0.5 | Q0.2 OFF; motor tetap OFF sampai START baru |
| START ditahan | Tahan START saat startup, STOP, atau RESET | Tidak restart otomatis; lepaskan lalu tekan START baru |

### Cara cepat dengan dua baris SIM table

Tambahkan `%IB0` dan `%QB0` dengan format hexadecimal. Set `%IB0=16#0E` untuk kondisi sehat. Jika CPU sudah RUN saat semua input nol, fault akan ter-latch: kirim `16#2E`, lalu `16#0E` untuk reset. Sesudah reset, pulse START dengan `16#0F`, lalu `16#0E`.

| Nilai IB0 | Kondisi | QB0 yang diharapkan |
|---|---|---|
| 16#0E | Sehat, tidak menekan tombol | 16#00 saat berhenti; 16#03 saat run latch aktif |
| 16#0F lalu 16#0E | START lalu dilepas | 16#03 |
| 16#0C lalu 16#0E | STOP lalu dipulihkan | 16#00 |
| 16#0A | E-Stop tidak sehat | 16#04 |
| 16#06 | Overload tidak sehat | 16#04 |
| 16#1E selama lebih dari 5 s saat berjalan | Sensor macet | 16#04 |
| 16#2E lalu 16#0E | RESET sehat lalu dilepas | 16#00 |

Sesudah pengujian, kembalikan CPU simulator ke **STOP** dan pastikan tidak ada force aktif.
