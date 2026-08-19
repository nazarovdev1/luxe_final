# Luxx.uz — to‘liq SEO audit

Audit sanasi: 2026-08-17  
Yo‘nalish: Google Search, desktop va mobile  
Asosiy so‘rovlar: `lux`, `lux uz`, `ayollar kiyimlari`, `premium kiyimlar`

## Natija

Audit boshida saytning taxminiy SEO holati **44/100** edi. Kritik texnik tuzatishlardan keyingi lokal build bahosi **56/100**. Eng katta o‘sish crawlable HTML, canonical va product schema hisobiga bo‘ldi. Kontent chuqurligi va mobil performance hali reytingni cheklaydi.

| Yo‘nalish | Hozirgi ball | Izoh |
|---|---:|---|
| Texnik SEO | 68/100 | Sitemap va metadata yaxshi; haqiqiy 404 va yagona responsive URL arxitekturasi qolgan |
| Kontent | 45/100 | 5 mahsulot tavsifi juda qisqa, bitta blogda to‘liq maqola yo‘q |
| On-page SEO | 70/100 | Crawlable H1, katalog va mahsulot linklari buildga qo‘shildi |
| Structured data | 78/100 | Product, Offer, Breadcrumb, ItemList va Organization initial HTML’da bor |
| Performance | 32/100 | 478 KB CSS, 696 KB asosiy JS, 1.4 MB mobil hero PNG |
| AI/GEO tayyorligi | 35/100 | Aniq faktlar va ekspert kontent yetarli emas |
| Image SEO | 38/100 | Alt matn bor; responsive ImageKit transformlari yetishmaydi |

## Qidiruv natijalari tahlili

Audit vaqtida `site:luxx.uz Luxx ayollar kiyimlari`, `lux uz ayollar kiyimlari` va `premium ayollar kiyimlari Toshkent` so‘rovlarida Luxx.uz ko‘rinmadi yoki yetakchi natijalarga kirmadi. Raqobatchi sahifalar Google’ga server HTML ichida kategoriya sarlavhasi, mahsulot nomlari, narxlar va tavsiflarni bevosita beradi. Luxx.uz live versiyasi esa audit boshida faqat metadata va bo‘sh `<div id="root"></div>` qaytarardi.

## Kritik topilmalar

### 1. Initial HTML’da sahifa kontenti yo‘q edi — tuzatildi

`generate-seo-pages.mjs` avval faqat `<head>` meta teglarini almashtirardi. Endi build vaqtida:

- bosh sahifa va katalog H1/intro copy oladi;
- real mahsulotlar crawlable `<a>` linklar bilan chiqadi;
- har bir mahsulot sahifasi H1, tavsif, narx, kategoriya va asosiy rasm oladi;
- `Product`, `Offer`, `BreadcrumbList` va `ItemList` JSON-LD initial HTML’ga yoziladi;
- API mahsulotlari bo‘sh qaytsa Vercel production deploy to‘xtaydi.

### 2. Mobile URL’lar noto‘g‘ri bosh sahifaga canonical qilinardi — tuzatildi

`/mobile/product/:id` kabi sahifalarning barchasi avval `/` canonical va global `noindex` olardi. Endi har bir mobil URL mos public URL’ga canonical qilinadi:

- `/mobile` → `/`
- `/mobile/products` → `/products`
- `/mobile/product/:id` → `/product/:id`

Public mobil yo‘llar robots.txt’da ochildi, shunda crawler canonical/noindex direktivasini ko‘ra oladi. Login, savat, checkout, profil, admin va orders bloklangan.

### 3. Product availability noto‘g‘ri `OutOfStock` chiqardi — tuzatildi

Production API `stock` maydonini bermaganda `Number(undefined) > 0` false bo‘lib, barcha mahsulotlar schema’da tugagan ko‘rinardi. Endi stock noma’lum bo‘lsa, xarid qilinadigan UI bilan mos ravishda `InStock`; aniq `0` bo‘lsa `OutOfStock` chiqadi.

### 4. Bo‘sh blog maqolasi indekslanardi — vaqtincha himoyalandi

Yagona blog postda excerpt bor, ammo to‘liq `content` yo‘q. U endi:

- `noindex, nofollow` oladi;
- sitemapga kiritilmaydi;
- to‘liq maqola yozilgach avtomatik ravishda indekslanadi.

### 5. Entity va share metadata — yaxshilandi

- Homepage title: `Premium ayollar kiyimlari Toshkentda | Luxx.uz`
- 1200×675 social preview sifatida `hero.jpg`
- `WebSite` va `Organization/OnlineStore` uchun barqaror `@id`
- Logo, Instagram, telefon, xizmat hududi va 14 kunlik return policy graphga bog‘landi
- Soxta 24/7 opening-hours va noaniq geo koordinata olib tashlandi

## Hali qolgan muammolar

### P0 — haqiqiy 404 yo‘q

Noma’lum URL va noto‘g‘ri product ID Vercel SPA fallback sabab HTTP 200 qaytaradi. React keyin “topilmadi” desa ham bu soft-404. Route-aware server/edge rendering yoki framework migratsiyasi bilan haqiqiy 404/410 qaytarish kerak.

### P0 — `www.luxx.uz` TLS sertifikati noto‘g‘ri

`https://www.luxx.uz/` sertifikat hostname tekshiruvidan o‘tmaydi. Kodga doimiy apex redirect qo‘shildi, ammo TLS brauzer redirectgacha tekshiriladi. Vercel Domains’da `www.luxx.uz` alohida biriktirilib sertifikat qayta chiqarilishi shart.

### P1 — mahsulot kontenti juda qisqa

Productionda atigi 5 mahsulot bor; tavsiflar 0–37 so‘z. Har bir mahsulotda quyidagilar kerak:

- fason va siluet;
- tasdiqlangan mato tarkibi;
- mavsum va foydalanish vaziyati;
- model bo‘yi/o‘lchami va fit tavsiyasi;
- parvarish;
- ishlab chiqaruvchi yoki kelib chiqish ma’lumoti;
- yetkazib berish/qaytarish;
- 3–5 real savol-javob.

### P1 — kategoriya topical authority yo‘q

`/products` bitta umumiy katalog. Inventar ko‘paygach `/ayollar-kostyumlari`, `/ayollar-paltolari`, `/dvoyka-va-troyka` kabi real, noyob kontentli kategoriya URL’lari kerak. Hozir duplicate doorway sahifalar yaratish tavsiya etilmaydi.

### P1 — mobile performance og‘ir

- global CSS: taxminan 478 KB raw;
- asosiy JS: taxminan 696 KB raw;
- mobile hero `hero-back.png`: taxminan 1.4 MB;
- product rasmlari original hajmda, `srcset/sizes` yo‘q.

ImageKit orqali `w-480/800`, `f-avif` yoki `f-webp`, `q-75/80` variantlari va aniq width/height qo‘shilishi kerak. CSS code-splitting oldingi deployment chunk muammosi bilan birga ehtiyotkor rollout qilinishi lozim.

### P1 — ishonch va E-E-A-T dalillari sust

Founder/stilist profili, yuridik nom, tekshirilgan manzil/ish vaqti, mahsulot QC jarayoni, real review manbasi va original ekspert maqolalari yo‘q. Saytdagi qattiq yozilgan satisfaction foizlari va demo testimoniallar faqat real dalil bo‘lsa qolishi kerak.

## Query mapping

| So‘rov | Asosiy landing | Tavsiya |
|---|---|---|
| `lux`, `lux uz` | `/` | Brand nomini har joyda `Luxx.uz` deb bir xil yozish; Organization aliases saqlandi |
| `ayollar kiyimlari` | `/products` | H1 va intro crawlable qilindi; kategoriya kontenti kengaytirilishi kerak |
| `premium kiyimlar` | `/products` va `/` | “Premium” da’vosini mato, bichim, QC va servis faktlari bilan isbotlash kerak |

## Tekshiruv natijalari

- Production build muvaffaqiyatli.
- SEO generator real API’dan 5 mahsulot va 1 blogni oldi.
- 24 ta HTML shell yaratildi: public, dynamic va private yo‘llar.
- Sitemapda 12 static + 5 product URL bor.
- Bo‘sh blog sitemapdan olib tashlandi.
- Katalog HTML’da 5 crawlable product link bor.
- Product HTML’da H1, price, description, Product/Offer va BreadcrumbList bor.
- `vercel.json` fayllari valid JSON.
- Indexdagi ikkala JSON-LD schema valid JSON.

## Eslatma

Kod deploy qilingach reyting darhol o‘zgarmaydi. Google Search Console’da sitemap qayta yuborilishi va muhim URL’lar uchun indexing so‘ralishi kerak. Brand natijasi odatda texnik qayta crawl’dan keyin tezroq, umumiy `ayollar kiyimlari` kabi so‘rovlar esa kontent, linklar va ishonch signallariga qarab haftalar yoki oylar davomida o‘sadi.
