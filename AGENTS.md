# Agent Directives & Codebase Guidelines (Luxe / Luxx.uz)

Ushbu fayl barcha yangi sessiyalar, subagentlar va loyiha ustida ishlaydigan har qanday AI agentlari uchun majburiy ko'rsatmalar to'plamidir.

---

## 1. Ikonkalar va Vizual Dizayn Qoidalari (QAT'IY QOIDA)

### 🚫 MUTLAQO TAQIQLANGAN: "Sparkles" / 4-qirrali Yulduzcha Ikonkasi
* **Hech qachon `Sparkles` (yulduzcha / 4-qirrali chaqnash) ikonkalarini ishlatmang!**
* Foydalanuvchi talabiga ko'ra, bu turdagi yulduzcha ikonkalari loyihada **butunlay taqiqlangan**.
* Sababi: 4-qirrali yulduzcha/sparkle belgilari Luxe brendining yuqori tabaqali (couture, editorial luxury) uslubiga mos kelmaydi va interfeysga arzon ko'rinish beradi.

### 🚫 IKONKALAR ORQASIGA FON/QUTICHA QO'YISH TAQIQLANADI (NO ICON BACKGROUND BOXES)
* **Ikonkalar orqasiga sun'iy fon, doira yoki to'rtburchak qutilar (masalan: `bg-[#d6b47c]/10`, `bg-white/5`, `rounded-lg`, `rounded-full` fon qutilari) qo'yilmasin!**
* Ikonkalar sof (pure), minimal, toza va nafis turishi shart.
* Ro'yxatlar, matn yonidagi belgilar, formalar va informatsion joylarda ikonkalar o'zining toza chiziqlari (stroke) va tilla/oq ranglari bilan to'g'ridan-to'g'ri ko'rinishi lozim.

### ✅ O'rniga Mos va Tavsiya Qilingan Ikonkalar:
1. **Foydalanuvchi / Profil / Avatar joylari uchun:**
   * `User`, `UserRound`
2. **Premium / VIP / Eksklyuzivlik aksentlari uchun:**
   * `Gem`, `Crown` yoki toza minimal geometrik urg'ular
3. **Katalog, fotogalereya, kamera, tahririyat (Editorial/Media):**
   * `Camera`, `Image`, `Eye`
4. **Kafolat, sifat va ishonch (Trust / Quality):**
   * `ShieldCheck`, `Check`, `CheckCircle2`
5. **Mahsulot, xarid, savat:**
   * `ShoppingBag`

---

## 2. Yuklanish va Lazy Loading Standartlari
* Sahifa yoki komponent yuklanishida oddiy, arzon aylanuvchi doira spinnerlar qo'yilmasin.
* Har doim brendga xos **Skeleton Shimmer** va **Progressive Lazy Loading** qo'llansin:
  * To'q luxury shisha fon (`#18181b` / `#111114`)
  * Tillarang shaffof shimmer to'lqini (`animate-[shimmer_2.2s_infinite] bg-gradient-to-r from-transparent via-[#d6b47c]/10 to-transparent`)
  * Rasmlarda `loading="lazy"` va `decoding="async"`, yuklangunga qadar skeleton turishi va yuklangach `blur-0 scale-100` bilan silliq ochilishi.

---

## 3. Kod Sifati va Tekshiruv
* Har qanday frontend o'zgarishidan so'ng `client` papkasida:
  * `npm run lint` — xatosiz o'tishi kerak.
  * `npm test -- --run` — barcha unit/komponent testlari 100% muvaffaqiyatli bo'lishi kerak.
* Backend o'zgarishlarida:
  * `npm run verify` — sintaksis, lint va testlar o'tishi shart.
