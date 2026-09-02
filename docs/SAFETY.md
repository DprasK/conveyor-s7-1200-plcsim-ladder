# Batas keselamatan

Proyek ini adalah bahan latihan dan demonstrasi PLCSIM, bukan program siap produksi.

- CPU standar dan program LAD ini bukan fungsi keselamatan tersertifikasi. Emergency stop harus memutus energi berbahaya melalui safety relay/PLC keselamatan yang dirancang berdasarkan penilaian risiko. `EStopOK` hanya sinyal pemantauan.
- Gunakan kontaktor, proteksi hubung singkat, overload, grounding, guard, dan perangkat lockout/tagout yang sesuai. Output PLC tidak boleh memberi daya motor secara langsung.
- Sensor macet tunggal tidak menjamin deteksi semua kondisi mekanis. Nilai `T#5s` hanyalah contoh dan harus dihitung dari kecepatan belt, panjang produk, serta risiko proses.
- Verifikasi alamat I/O, fail-safe state output, arah motor, dan respons ketika CPU STOP atau kehilangan daya sebelum commissioning.
- Jangan force atau bypass input keselamatan pada mesin nyata. Skenario force di dokumentasi hanya untuk PLCSIM terisolasi.

