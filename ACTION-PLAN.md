# Luxx.uz SEO action plan

## Deploy bilan bajarilgan

- [x] Real crawlable static HTML generatsiyasi
- [x] Product/Offer/Breadcrumb/ItemList schema initial HTML’da
- [x] Mobile canonical mapping va robots muvofiqligi
- [x] Noma’lum stock sababli yolg‘on OutOfStock’ni tuzatish
- [x] Bo‘sh blog postni noindex qilish va sitemapdan chiqarish
- [x] Homepage title, description va social preview’ni tozalash
- [x] Organization/OnlineStore entity graphini yaxshilash
- [x] Footer’dan katalog va blogga tavsifli ichki linklar
- [x] Trailing slash normalizatsiyasi va basic security headers
- [x] Build-time API bo‘sh bo‘lsa production deployni to‘xtatish

## Deploydan keyin 24 soat ichida

1. Vercel’da `www.luxx.uz` domainini qayta biriktirib TLS sertifikatini chiqarish.
2. Google Search Console’da `https://luxx.uz/sitemap.xml` ni qayta yuborish.
3. URL Inspection orqali `/`, `/products` va 5 ta product URL uchun “Request indexing”.
4. Rich Results Test’da kamida 2 product URL’ni tekshirish.
5. Live source’da H1 va Product JSON-LD initial HTML ichida borligini tekshirish.

## 1-hafta — kontent va trust

1. Har bir mahsulot tavsifini 300+ foydali so‘zga yetkazish; faqat tasdiqlangan material/origin ma’lumotidan foydalanish.
2. Ruscha yoki aralash product nomlarini tabiiy o‘zbekcha nomlar bilan birxillashtirish.
3. Yagona blog maqolasiga 1,500+ so‘zli real matn, H2 bo‘limlar, original misollar, muallif va yangilangan sana qo‘shish.
4. About/Contact/Footer/schema’dagi telefon, email, manzil va ish vaqtini tekshirib bir xil qilish.
5. Demo testimonial va isbotsiz foizlarni real review manbasi bilan almashtirish yoki olib tashlash.

## 2-hafta — performance

1. `hero-back.png` uchun 430/768 px AVIF/WebP variantlar yaratish.
2. ImageKit product URL’lariga responsive transform, `srcset`, `sizes`, width va height qo‘shish.
3. Faqat LCP rasmga eager/fetchpriority; qolgan galereya rasmlariga lazy loading.
4. Asosiy JS bundle’ni route/vendor chunklarga ajratish.
5. CSS code splittingni staging’da chunk deployment recovery bilan sinash.
6. 360×800, 390×844, 430×932 iOS/Android o‘lchamlarida Lighthouse va real-device profiling.

## 30 kun — topical authority

1. Kamida 8–12 foydali maqola: o‘lcham tanlash, kostyum fit, palto mavsumi, mato parvarishi, kapsula garderob.
2. Inventar yetarli bo‘lganda noyob kategoriya landinglar: kostyumlar, paltolar, dvoyka/troyka.
3. Har maqoladan mos kategoriya va mahsulotlarga, mahsulotlardan o‘lcham/qarov maqolalariga ichki link.
4. Google Business Profile, Instagram va mahalliy kataloglarda NAP/brand nomini `Luxx.uz` bilan bir xil qilish.
5. Search Console query/page hisobotida impressions, CTR va average position’ni haftalik solishtirish.

## 60–90 kun — platform

1. React SPA fallback o‘rniga route-aware SSR/SSG yoki edge renderingga o‘tish.
2. Noma’lum URL/product/blog uchun haqiqiy HTTP 404/410.
3. Bitta responsive canonical URL daraxtiga o‘tib `/mobile/*` public dublikatlarini bosqichma-bosqich yopish.
4. Product va blog o‘zgarishida sitemapni avtomatik yangilash/deploy qilish.
5. Mahsulot schema’ga tekshirilgan SKU/GTIN/brand/material/color/size, shipping va return details qo‘shish.

## KPI

- Indexed valid pages: 17 public URL’ning barchasi
- Brand query (`luxx uz`) uchun top 1–3
- `/products` impressions va non-brand clicks oylik o‘sishi
- Product rich result valid items: 5/5
- Mobile LCP < 2.5 s, INP < 200 ms, CLS < 0.1
- 90 kun ichida 10+ sifatli indexable editorial maqola
