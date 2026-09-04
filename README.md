# Conveyor S7-1200 — TIA Portal V16

Satu proyek conveyor sederhana menggunakan **Siemens S7-1200**, bahasa **LAD (Ladder Diagram)**, dan **S7-PLCSIM V16**.

## Membuka proyek

1. Download [Conveyor_LAD_V16.zap16](Conveyor_LAD_V16.zap16).
2. Di TIA Portal V16 pilih **Project > Open**.
3. Pilih file `.zap16`, lalu retrieve ke folder lokal.
4. Buka file `.ap16` hasil retrieve.

Target PLC: **CPU 1214C DC/DC/DC**, `6ES7 214-1AG40-0XB0`, firmware V4.4.

## Pemetaan I/O

| Alamat | Tag | Fungsi |
|---|---|---|
| I0.0 | Conveyor_StartButton | Tombol START |
| I0.1 | Conveyor_StopOK | Rangkaian STOP sehat |
| I0.2 | Conveyor_EStopOK | E-Stop eksternal sehat |
| I0.3 | Conveyor_OverloadOK | Overload motor sehat |
| I0.4 | Conveyor_JamSensor | Sensor produk macet |
| I0.5 | Conveyor_ResetButton | Tombol RESET |
| Q0.0 | Conveyor_MotorCmd | Perintah motor |
| Q0.1 | Conveyor_RunLamp | Lampu RUN |
| Q0.2 | Conveyor_FaultLamp | Lampu FAULT |

`FirstScan` berasal otomatis dari `Initial_Call` OB1. `RunLatch`, `FaultLatch`, `StartPrev`, dan `JamTimer` tersimpan di instance DB dan tidak memakai alamat input fisik.

## Simulasi tanpa Force

1. Jalankan **S7-PLCSIM V16**, kemudian download proyek hanya ke **Simulated module**.
2. Ubah CPU virtual ke **RUN**.
3. Pada tampilan proyek PLCSIM, buat **SIM table**.
4. Tambahkan `I0.0` sampai `I0.5` dengan format `Bool`.
5. Set kondisi awal: `I0.1`, `I0.2`, dan `I0.3` = TRUE; input lainnya FALSE.
6. Pulse `I0.5` untuk RESET, kemudian pulse `I0.0` untuk START.

Input diubah melalui SIM table PLCSIM, bukan melalui deklarasi parameter FB. `Q0.0`–`Q0.2` merupakan output program dan hanya dipantau.

## Status

- Compile TIA Portal V16: **0 error**.
- Download ke S7-PLCSIM V16: **0 error**.
- Force table berisi keenam input, tetapi SIM table PLCSIM dapat digunakan jika tidak ingin forcing.

Proyek ini hanya untuk pembelajaran dan simulasi. Jangan langsung digunakan pada mesin fisik tanpa desain keselamatan dan pengujian yang sesuai.
