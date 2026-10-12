# Luxx.uz — ishga tushirish rejasi (to'lov integratsiyasisiz)

Tuzilgan sana: 2026-10-12
Maqsad: 2–3 haftada xavfsiz, tez, Google'da ko'rinadigan va ishonch uyg'otadigan "soft launch".
Hozircha qilinmaydi: Click / Payme / Uzum Nasiya (keyingi bosqich), AI funksiyalari (pul talab qiladi), SSR migratsiyasi.

## Ishlash qoidalari

- Har bosqich oxirida: `client`: `npm run lint`, `npm test -- --run`, `npm run build`; `server`: `npm run verify`.
- `AGENTS.md` qoidalari saqlanadi: Sparkles ikonkasi yo'q, ikonka orqasida fon qutisi yo'q, skeleton shimmer.
- Har bir funksiya uchun kamida bitta test yoziladi (server `tests/` papkasida).
- Kichik o'zgarishlar, har biri alohida commit. Hech narsa tekshiruvsiz "tayyor" deb belgilanmaydi.

## Hozirgi holat (kod va auditlar asosida)

| Topilma | Joyi |
|---|---|
| `pre('save')` ichida `next()` dan keyin kod davom etadi, parol qayta xeshlanishi mumkin | `server/models/user.model.js` |
| CORS: `origin.endsWith('.vercel.app')` istalgan vercel.app saytiga ruxsat beradi | `server/server.js` |
| SMS sozlanmagan bo'lsa `{ success: true, simulated: true }` qaytadi (parol tiklash kodi yetib bormaydi, lekin "muvaffaqiyatli" ko'rinadi) | `server/services/sms.service.js` |
| Mehmon buyurtmasi telefon tasdiqlashsiz, faqat umumiy rate limit | `server/routes/order.route.js` |
| Buyurtma faqat Telegramga yuboriladi, qayta urinish yo'q | `server/services/telegram.service.js` |
| Review modelida faqat rating/comment bor (rasm, o'lcham, bo'y yo'q) | `server/models/review.model.js` |
| `premium-features-plan.md` Click/Payme'ni ✅ deb yozgan, kodda faqat `cash_on_delivery` | `plans/`, `order.model.js` |
| Productionda 5 ta mahsulot, tavsiflar 0–37 so'z | `FULL-AUDIT-REPORT.md` |
| Soft-404, `www` TLS, og'ir JS/CSS/rasm | `FULL-AUDIT-REPORT.md` |
| `FlashSaleBar` va `Checkout LocationMarker` ichida aniqlanmagan `t`, hero papka nomi (`animatedimage` / `animatedimagee`), buzilgan encoding | `reports/loyiha-tahlili.md` |

---

## 0-bosqich — Xatolar va xavfsizlik (1–2 kun)

Bu bosqich tugamaguncha boshqasiga o'tilmaydi.

| # | Vazifa | Qabul mezoni |
|---|---|---|
| 0.1 | `user.model.js`: `return next()` qo'shish (yoki hook'ni `async` + `next`siz qilish). Test: parolni o'zgartirmasdan `user.save()` qilingach login ishlashi | Test yashil |
| 0.2 | CORS: `.vercel.app` qoidasini olib tashlash, faqat `CORS_ORIGINS` env ro'yxati | Begona originlar rad etiladi (test) |
| 0.3 | SMS: productionda sozlanmagan bo'lsa `simulated` emas, aniq xato; parol tiklash Telegram orqali ham mumkin bo'lsin (3.5 bilan) | Prod'da yolg'on "yuborildi" yo'q |
| 0.4 | Buyurtma limiti: IP bo'yicha 5/soat, telefon bo'yicha 3 ochiq buyurtma, maks. mahsulot soni/miqdor, `+998XXXXXXXXX` formati majburiy | Spam testi 429 qaytaradi |
| 0.5 | Sirlar: `git log -p` / gitleaks bilan `.env`, `firebase-service-account.json`, kalitlar tarixda bormi tekshirish; bo'lsa hammasini almashtirish | Hisobot, kerak bo'lsa rotatsiya |
| 0.6 | Helmet CSP: avval `report-only`, keyin yoqish | Konsolda bloklangan resurs yo'q |
| 0.7 | Mijoz xatolari: `FlashSaleBar` `t`, `LocationMarker` `t`, hero asset yo'li, encoding (mojibake) tozalash, demo `data/products.js` fallback'ni production'dan ajratish | Lint/test/build yashil, brauzer konsolida xato yo'q |
| 0.8 | Telegram yetkazilmasa: `order.notifiedAt` maydoni + qayta urinish (cron, 3 marta); admin panelda "yangi buyurtma" belgisi va ovozi | Telegramni o'chirib buyurtma berilganda ham admin ko'radi |
| 0.9 | Fokus: AI Stylist, Reels, Live, Challenges, StyleFeed ni feature flag orqasiga yashirish (navbar va mobil menyudan); kod o'chirilmaydi | Flag o'chiq: menyuda yo'q, API 404 emas, UI ko'rinmaydi |
| 0.10 | Hujjatlarni to'g'rilash: `premium-features-plan.md` dagi to'lov ✅ belgilari; qaytarish muddati (14 kun) bitta manbadan (`config/policies`) hamma joyda: mahsulot, checkout, FAQ, Terms | Barcha joyda bir xil raqam |

## 1-bosqich — SEO texnik asos (2–4 kun, 0-bosqich bilan parallel boshlash mumkin)

| # | Vazifa | Qabul mezoni |
|---|---|---|
| 1.1 | `www.luxx.uz` ni Vercel Domains'ga biriktirish, sertifikat | `curl -I https://www.luxx.uz` redirect beradi |
| 1.2 | Haqiqiy 404: build vaqtida `seo-manifest.json` (barcha mahsulot/blog slug'lari); catch-all rewrite o'rniga Edge Middleware: manifestda yo'q `/product/:id`, `/blog/:slug` uchun 404 sahifa va HTTP 404 | Noma'lum URL 404, mavjud URL 200 |
| 1.3 | Mahsulot yoki blog o'zgarganda avtomatik qayta deploy: admin saqlaganda Vercel Deploy Hook (debounce 5 daqiqa) | Yangi mahsulot sitemap va statik HTML'da paydo bo'ladi |
| 1.4 | Performance: `hero-back.png` → AVIF/WebP (430/768/1280); ImageKit yordamchi funksiyasi `ik(url,{w,f,q})` + `srcset`/`sizes`/width/height; faqat LCP rasmga `fetchpriority=high`; route darajasida `React.lazy`; ijtimoiy modullar (Reels/Live/StyleFeed/Challenges) alohida chunk | Lighthouse mobil: JS < 300 KB boshlang'ich, LCP < 2.5 s (`perf_audit.js` bilan oldin/keyin o'lchash) |
| 1.5 | Structured data: `MerchantReturnPolicy`, `OfferShippingDetails`, `brand`, `material`, `sku`; `AggregateRating` faqat haqiqiy sharhlar bo'lganda | Rich Results Test: xatosiz |
| 1.6 | Qidiruv tizimlariga ulash: Google Search Console, Yandex Webmaster, Bing; sitemap yuborish; Yandex Metrica + GA4 | Konsollarda sitemap "qabul qilindi" |
| 1.7 | `sameAs` (Instagram, Telegram), NAP (nom, manzil, telefon) hamma joyda bir xil; Google Business Profile | Schema va footer mos |
| 1.8 | Kategoriya sahifalari: `/kostyumlar`, `/paltolar`, `/dvoyka-troyka` — faqat har birida kamida 8 ta mahsulot bo'lganda, noyob matn bilan | Dublikat/yupqa sahifa yo'q |
| 1.9 | Voqea sahifalari: `/ofis-kostyumi`, `/toyga-kiyim`, `/hayit-kiyim` (haqiqiy tanlov va maslahat matni bilan) | Har biri 400+ so'z, ichki linklar |

## 2-bosqich — Mahsulot kontenti va ishonch (3–6 kun, ma'lumotni siz berasiz)

| # | Vazifa | Qabul mezoni |
|---|---|---|
| 2.1 | Product modeliga: `fabricComposition`, `careInstructions`, `origin`, `sku`, `modelHeightCm`, `modelSize`, `fitNote`, `alterationFree`, `occasions[]`, `videoUrl`. Admin `ProductForm` va `ProductView` yangilanadi | Admin'da saqlanadi, sahifada ko'rinadi |
| 2.2 | Siz uchun CSV shablon (har mahsulot uchun real ma'lumot), men 300+ so'zli o'zbekcha tavsiflarni shu faktlardan yozaman (faktlarni o'zim to'qimayman) | Har mahsulotda 300+ so'z, faqat tasdiqlangan faktlar |
| 2.3 | O'lcham jadvali va "o'lchamimni top" (qo'lda yig'ilgan jadval, AI emas) | Har kategoriyada jadval |
| 2.4 | Ishonch sahifalari: About (asoschi, yuridik nom, manzil, ish vaqti), Yetkazish, Qaytarish; Home'dagi demo testimonial va isbotsiz foizlarni olib tashlash | Soxta ma'lumot qolmagan |
| 2.5 | Foto/video: har mahsulotga kamida 4 rasm + qisqa video (telefon bilan), model bo'yi va o'lchami yozilgan | Barcha mahsulotlarda |
| 2.6 | Blog: 8–12 maqola (o'lcham tanlash, kostyum fit, palto mavsumi, mato parvarishi, kapsula garderob, to'yga kiyim...). Yagona blog postga to'liq matn | 1,500+ so'z, muallif, sana |

## 3-bosqich — Farqlovchi funksiyalar, AI'siz (6–10 kun)

| # | Funksiya | Kod ishi | Jarayon ishi |
|---|---|---|---|
| 3.1 | **Kiyib ko'rib to'lash** | `order.fulfillment.tryOn`; item holati `kept/returned`; admin "yakuniy hisob" endpointi; qaytgan mahsulot zaxiraga qaytadi; checkout'da belgi | Kuryer 15 daqiqa kutadi, siz qoidani belgilaysiz |
| 3.2 | **Ikki o'lcham olib borish** | Checkout'da "boshqa o'lchamni ham olib boring"; ikkinchi birlik yetkazilgunga qadar band qilinadi va qaytariladi | Faqat zaxira ≥ 2 bo'lsa |
| 3.3 | **Bepul tikuv moslashtirish** | `alterationFree` belgisi va nishon, buyurtmaga izoh | Tikuvchi bilan kelishuv |
| 3.4 | **Haqiqiy fit statistikasi** | Review'ga `purchasedSize`, `heightCm`, `weightKg`, `fit`, `photos[]`, `approved`; faqat yetkazilgan buyurtma egasi yoza oladi; `/api/reviews/fit-summary/:productId`; kamida 3 ta javob bo'lganda ko'rsatiladi | Sharhlarni moderatsiya qilish |
| 3.5 | **Telegram mijoz boti** | `/api/telegram/webhook` (secret token); `/start` + telefon ulashish = tasdiqlangan telefon (SMS'siz, bepul OTP o'rniga); buyurtma holati, qayta sotuvga chiqdi, narx tushdi (`priceAlert.service.js` ishlatiladi); `/order` bilan kuzatish | BotFather'da bot, privacy matni |
| 3.6 | **Qayta sotuvga chiqdi** | `StockAlert` modeli (mahsulot, o'lcham, telegramId); admin zaxirani yangilaganda xabar | — |
| 3.7 | **Buyurtmani kuzatish** (mehmon uchun) | `/track`: buyurtma raqami + telefonning oxirgi 4 raqami, status vaqt chizig'i | — |
| 3.8 | **Telegram bilan tasdiqlangan buyurtma** | Tasdiqlangan telefon → buyurtma avtomatik qabul; tasdiqlanmagan → "operator qo'ng'iroq qiladi" holati (0.4 spamni yopadi) | Operator kim qo'ng'iroq qiladi |
| 3.9 | **Admin yordamchilari** | Kunlik hisobot Telegramga, kam zaxira ogohlantirishi, buyurtmalar ro'yxatida filtr | — |

Tartib: 3.5 → 3.8 → 3.1/3.2 → 3.4 → 3.6/3.7 → 3.3/3.9. Sabab: tasdiqlangan telefon spam muammosini yopadi va keyingi funksiyalar unga tayanadi.

## 4-bosqich — Tekshiruv va ishga tushirish (3–4 kun)

| # | Vazifa | Qabul mezoni |
|---|---|---|
| 4.1 | Analytics hodisalari: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, Telegram bot ulash bosilishi (GA4 + Yandex Metrica) | Real vaqtda ko'rinadi |
| 4.2 | Testlar: har yangi funksiya uchun server testi; Playwright bilan mobil va desktop uchun mehmon va ro'yxatdan o'tgan checkout smoke testi | CI'da yashil |
| 4.3 | Staging: Vercel preview + alohida MongoDB (Atlas free M0); production bilan bir xil env shakli | Staging'da to'liq oqim |
| 4.4 | Zaxira: kunlik `mongodump`/Atlas backup + bir marta tiklash sinovi | Tiklash sinovdan o'tgan |
| 4.5 | Monitoring: UptimeRobot `/api/health`, Sentry (bepul reja), 5xx ogohlantirishi Telegramga | Test ogohlantirish keldi |
| 4.6 | `production-release-checklist.md` ni to'lov bandlaridan tashqari to'liq o'tish | Barcha band belgilangan |
| 4.7 | Soft launch: 20–30 ta tanish mijoz, 1 hafta, har kuni xatolar ro'yxati | Kritik xato yo'q |

## Marketing (kod emas, bosqichlar bilan parallel)

- Instagram va Telegram kanal: har mahsulot uchun video, "kiyib ko'rib to'lash" va "bepul tikuv" asosiy va'da.
- 5–10 mikro-influenser bilan barter; do'stni taklif qilish (referral) allaqachon kodda bor.
- Bio-link UTM bilan mahsulot sahifalariga; Google Business Profile.
- Birinchi 30 kun KPI: Search Console impressions, bot ulanishlar soni, savatga qo'shish → buyurtma nisbati, kiyib ko'rilganlardan sotib olinganlar ulushi.

## Siz berishingiz kerak bo'lgan narsalar

1. Har mahsulot uchun real ma'lumot (mato, o'lchamlar, bo'y/o'lcham model, kelib chiqishi) — men CSV shablon beraman.
2. Foto/videolar.
3. Yuridik nom, manzil, ish vaqti, asoschi haqida matn (About uchun).
4. Vercel, DNS (domen), Search Console, BotFather uchun kirish yoki ularni sozlashda yordam.
5. Qaror: kiyib ko'rib to'lashda kuryer necha daqiqa kutadi, rad etilsa yetkazish haqi olinadimi; qaytarish muddati (14 kun saqlanadimi).

## Keyingi bosqich (hozir emas)

Click/Payme/Uzum Nasiya (YaTT/MChJ kerak, webhook va idempotency testlari bilan), SSR yoki route-aware edge rendering, `/mobile/*` URL'larni yagona responsive daraxtga birlashtirish, ruscha URL'lar va hreflang.

## Xavflar

- Mahsulot kontenti va fotolar kodga bog'liq emas, lekin SEO va ishonch uchun eng muhim. Ular kechiksa, texnik ishlar natija bermaydi.
- Kiyib ko'rib to'lash kuryer vaqtini oladi; shaharda qancha buyurtma bilan ishlay olishingizni baholab, avval 1–2 hudud bilan boshlang.
- Uchinchi tomon (Vercel, Atlas, Telegram) bepul rejalari cheklangan; trafik o'sganda pulli rejaga o'tish kerak bo'lishi mumkin.
