# Status validasi

| Pemeriksaan | Status |
|---|---|
| Unit test model scan PLC | 8 skenario lulus |
| Konsistensi source LAD hasil generator | Lulus |
| Pemetaan 6 DI + 3 DQ unik | Lulus |
| Bahasa blok FB dan OB | LAD |
| Compile TIA Portal V16 | Belum direkam pada rilis awal |
| Uji S7-PLCSIM V16 | Panduan tersedia; belum direkam pada rilis awal |

Tes Node memeriksa perilaku logika dan konsistensi artefak, tetapi tidak menggantikan compiler Siemens atau pengujian hardware. Jalankan `npm test` dan `npm run check:lad` untuk mengulang pemeriksaan lokal.

