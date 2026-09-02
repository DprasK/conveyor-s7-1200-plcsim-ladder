# Daftar network Ladder

Program utama berada di `FB_Conveyor_LAD [FB2]`. Semua network memakai LAD native TIA Portal; tidak ada blok SCL.

| NW | Fungsi |
|---:|---|
| 1 | Reset `RunLatch` pada first scan CPU. |
| 2 | Reset `FaultLatch` pada first scan CPU. |
| 3 | Set fault jika `EStopOK = FALSE`. |
| 4 | Set fault jika `OverloadOK = FALSE`. |
| 5 | TON `JamTimer` berjalan selama motor ON dan sensor macet aktif. |
| 6 | Set fault ketika `JamTimer.Q = TRUE`. |
| 7 | Reset fault hanya jika STOP, E-Stop, overload sehat dan sensor macet bebas. |
| 8 | Set `RunLatch` saat START dan seluruh permissive sehat. |
| 9 | Reset `RunLatch` saat STOP ditekan. |
| 10 | Reset `RunLatch` saat E-Stop tidak sehat. |
| 11 | Reset `RunLatch` saat overload trip. |
| 12 | Reset `RunLatch` saat fault aktif. |
| 13 | Aktifkan `MotorCmd` dari latch dan seluruh permissive. |
| 14 | `RunLamp` mengikuti `MotorCmd`. |
| 15 | `FaultLamp` mengikuti `FaultLatch`. |

`Main [OB1]` hanya memanggil FB tersebut melalui `DB_Conveyor_LAD [DB2]` dan memetakan PLC tags fisik. Nilai awal `JamTime` pada pemanggilan OB1 adalah `T#5s`.

