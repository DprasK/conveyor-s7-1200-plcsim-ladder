# Uji dengan Siemens S7-PLCSIM

Panduan ini memakai TIA Portal V16 dan S7-PLCSIM V16. Lakukan hanya pada simulator yang tidak terhubung ke mesin.

## 1. Membuat proyek TIA

1. Buat project baru dan tambahkan CPU **S7-1200 CPU 1214C DC/DC/DC**, contoh order number `6ES7 214-1AG40-0XB0`, firmware yang tersedia di katalog V4.4.
2. Pastikan alamat digital input dimulai di `%I0.0` dan digital output di `%Q0.0`.
3. Di **PLC tags**, impor `source/Conveyor_IO_LAD.xml` melalui **Import**.
4. Di **Program blocks**, impor berurutan:
   - `source/FB_Conveyor_LAD.xml`
   - `source/DB_Conveyor_LAD.xml`
   - hapus hanya `Main [OB1]` kosong dari proyek baru, lalu impor `source/Main_LAD.xml`
5. Jalankan **Compile > Software (rebuild all)**. Jangan lanjut jika masih ada error.

Jika TIA menolak impor karena versi schema, ekspor satu blok LAD kosong dari versi TIA yang dipakai dan bandingkan versi namespace-nya. Paket ini ditujukan untuk schema TIA Portal V16.

## 2. Menjalankan PLCSIM

1. Klik **Start simulation**, pilih CPU simulasi, kemudian download konfigurasi ke PLCSIM.
2. Ubah CPU PLCSIM ke **RUN**.
3. Buat SIM table berisi alamat `%I0.0`–`%I0.5` dan `%Q0.0`–`%Q0.2`.
4. Set kondisi sehat awal: `%I0.1=1`, `%I0.2=1`, `%I0.3=1`, `%I0.4=0`. Input lain 0.

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

Sesudah pengujian, kembalikan CPU simulator ke **STOP** dan pastikan tidak ada force aktif.

