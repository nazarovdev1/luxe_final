# Luxx.uz Google'da chiqishi uchun: sizning qadamlaringiz

Kod tomoni tayyor: kategoriya sahifalari, ruscha versiya, nomli mahsulot manzillari, to'g'ri sitemap.
Endi natijani shu ro'yxatdagi ishlar beradi. Tartib bo'yicha bajaring — eng kuchlisi birinchi.

Kutilma: Google yangi sahifalarni 1–4 haftada indeksga oladi, qidiruvda ko'rinish 2–4 oyda o'sadi.
Bu normal, sabr kerak.

---

## 1. Bir martalik sozlash (deploy'dan keyin darhol, 30 daqiqa)

### 1.1. Vercel Deploy Hook — yangi mahsulot Google'ga avtomatik chiqishi uchun
Sayt Google uchun har mahsulotga alohida sahifa yasaydi, lekin faqat sayt qayta qurilganda.
Shu sozlama bo'lmasa, admin paneldan qo'shgan mahsulotingiz Google'ga keyingi kod o'zgarishigacha chiqmaydi.

1. vercel.com → loyiha → **Settings → Git → Deploy Hooks**.
2. Nom: `catalog`, branch: `main` → **Create Hook**. Chiqqan havolani nusxalang.
3. Google Cloud Console → Cloud Run → `luxe-backend` → **Edit & deploy new revision → Variables** →
   `VERCEL_DEPLOY_HOOK_URL` = shu havola → **Deploy**.
4. GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret** →
   `VERCEL_DEPLOY_HOOK_URL` = o'sha havola. (Har kuni ertalab 06:00 da sayt avtomatik yangilanadi.)

Havolani hech kimga bermang va chatga yozmang — u bilan har kim saytni qayta qurdira oladi.

### 1.2. Google Search Console
1. **Sitemaps** → `sitemap.xml` ni olib tashlab, qayta qo'shing (endi 45 ta havola, oldin 29).
2. **URL Inspection** → quyidagilarni birma-bir kiritib **Request indexing** bosing:
   - `https://luxx.uz/`
   - `https://luxx.uz/ru`
   - `https://luxx.uz/products`
   - `https://luxx.uz/kategoriya/palto-plash`
   - `https://luxx.uz/kategoriya/kastyum-shim`
   - `https://luxx.uz/kategoriya/kastyum-yubka`
   - `https://luxx.uz/kategoriya/dvoyka-troyka`
3. Eski ikki "xato"ga e'tibor bermang:
   - `http://luxx.uz/` — "Page with redirect": sayt https'ga o'tkazadi, bu to'g'ri.
   - `/products?category=...` — "Alternate page with proper canonical": filtr havolalari, bu ham to'g'ri.
   "Validate fix" bosish shart emas.
4. Haftada bir marta **Performance → Queries** ni oching: odamlar nima deb qidirib kirayotganini ko'rasiz.
   Ko'p chiqqan so'zlarni mahsulot nomi va tavsifiga qo'shing.

### 1.3. Yandex Webmaster (Rossiya va ruscha qidiruv uchun)
1. webmaster.yandex.ru → saytni qo'shing → tasdiqlash usuli **Meta tag** → kodni nusxalang
   (`content="..."` ichidagi qiymat).
2. Vercel → Settings → Environment Variables → `YANDEX_VERIFICATION` = shu qiymat → Redeploy.
3. Tasdiqlangach: **Indexing → Sitemap files** → `https://luxx.uz/sitemap.xml`.

---

## 2. Mahsulotlar — eng muhim ish

Hozir saytda 5 ta mahsulot bor, har birida 1 ta rasm. Google uchun bu juda kam: kategoriya sahifasi
2 ta mahsulot bilan "bo'sh do'kon" bo'lib ko'rinadi.

**Maqsad:** kamida 25–30 ta mahsulot. Har birida:
- **4–6 ta rasm**: old, orqa, yon, mato yaqindan, kiyib turilgan holda.
- **60+ so'zli tavsif**: mato tarkibi (masalan "70% jun, 30% kashmir"), kimga mos, nima bilan kiyiladi,
  parvarish (kimyoviy tozalash / 30° da yuvish).
- **To'g'ri kategoriya**: bitta kategoriya nomini doim bir xil yozing ("Palto plash" — "palto" emas).
  Yangi kategoriya qo'shsangiz, unga ham avtomatik sahifa ochiladi.

**Nom qolipi:** `Nima + rang + mato/brend + farqi`. Odam Google'ga shunday yozadi.

Hozirgi 5 ta mahsulot uchun tayyor nomlar (admin → tahrirlash → nomni almashtiring):

| Hozir | Taklif |
|---|---|
| MAX MARA PALTO | Max Mara bordo jun palto, ikki qator tugmali (original) |
| Bordo Elegant Blazer-Palto — Double Button, Premium Look | Bordo blazer-palto, ikki qator tugmali |
| NORKA firmasining Premium sifatidagi kastyum shimlari | NORKA qora shimli kostyum, oltin tugmali blazer bilan |
| Printli Jaket + Qora Keng Shim SET | Printli jaket va qora keng shim to'plami |
| ВЕЧЕРНЫЙ КОСТЮМ ЮБКА | Kechki yubkali kostyum |

"ВЕЧЕРНЫЙ КОСТЮМ ЮБКА" da tavsif umuman yo'q — birinchi shuni to'ldiring.

Nomni o'zgartirsangiz manzil ham yangilanadi; eski havolalar o'zi yangi manzilga o'tadi,
hech narsa buzilmaydi.

---

## 3. Google Maps kartochkasi (Google Business Profile)

"Toshkentda ayollar kiyimi" kabi qidiruvlarda xarita bloki saytdan ham yuqorida chiqadi.

1. business.google.com → kartochkangizni oching.
2. **Website**: `https://luxx.uz`.
3. **Category**: "Women's clothing store" (Ayollar kiyimi do'koni).
4. Ish vaqti, telefon `+998 88 429 99 69`, manzil — saytdagi bilan bir xil bo'lsin.
5. **Photos**: kamida 10 ta — do'kon tashqarisi, ichi, kiyimlar, siz.
6. **Products**: eng yaxshi 5–10 mahsulotni narxi va sayt havolasi bilan qo'shing.
7. **Sharhlar**: har xaridordan sharh so'rang. Kartochkadagi "Ask for reviews" havolasini
   Telegram'da yuboring. Har bir sharhga javob yozing.
8. Haftada 1 ta **post**: yangi kelgan kiyim, rasm va sayt havolasi bilan.

Soxta sharh yozdirmang — Google buni aniqlaydi va kartochkani pastga tushiradi.

## 4. Yandex Business va 2GIS
Toshkentda ko'pchilik 2GIS va Yandex Kartadan qidiradi. Ikkalasida ham bepul kartochka oching:
o'sha manzil, telefon, ish vaqti, rasmlar va `https://luxx.uz` havolasi.

## 5. Havolalar (Google saytga ishonishi uchun)
- Instagram va Telegram bio'siga `luxx.uz` yozing.
- Har postda mahsulot havolasini bering. Telefondagi "Ulashish" tugmasi endi to'g'ri
  manzilni beradi: Telegram'da rasm va nom bilan chiqadi.
- goldenpages.uz, yellowpages.uz va shunga o'xshash Toshkent kataloglarida ro'yxatdan o'ting.
- Tanish blogerlar yoki do'stlar o'z sahifasida luxx.uz ni eslatsa — bu eng kuchli havola.

## 6. Blog
Haftasiga 1 ta maqola, xarid qilmoqchi bo'lgan odamning savoliga javob:
"Qishga qanday palto tanlash kerak", "To'yga nima kiyish", "Ofisga 5 ta obraz".
Har maqolada 2–3 ta mahsulot yoki kategoriya sahifasiga havola qo'ying.

---

## Nima o'zgardi (texnik, ma'lumot uchun)
- `/kategoriya/palto-plash` kabi 4 ta kategoriya sahifasi — o'z sarlavhasi, matni va mahsulotlari bilan.
- Ruscha versiya: `/ru`, `/ru/products`, `/ru/kategoriya/...` va boshqalar. Google ularni
  bir-birining tarjimasi deb biladi (hreflang).
- Mahsulot manzili nom bilan: `/product/max-mara-palto-697c...`.
- Mahsulot sahifasida Google uchun: o'lchamlar, yetkazish (shu kuni, bepul), 14 kun qaytarish.
- Mavjud bo'lmagan sahifa endi haqiqiy "404" qaytaradi.
- Sitemap: 29 → 45 havola, mahsulot rasmlari bilan.
- Admin mahsulot yoki maqola qo'shsa, sayt o'zi qayta quriladi (1.1-banddagi sozlamadan keyin).
