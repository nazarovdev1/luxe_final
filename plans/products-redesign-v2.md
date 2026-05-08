# 🏗️ Products Redesign V2 — Clean Minimal Luxury

## ❌ V1 Muammo (Nima noto'g'ri bo'ldi)

V1 dizaynda quyidagi muammolar bor edi:
- Juda ko'p gradientlar: `bg-gradient-to-b from-[#10182a]/94 to-[#0a1220]/92`
- Juda ko'p soyalar: `shadow-[0_22px_54px_rgba(3,8,22,0.5)]`
- Juda ko'p dekorativ elementlar: `pointer-events-none` glow divs
- Emoji ishlatilgan: 💳🔥 — professional emas
- Collapsible accordionlar — luxury saytlarda kam ishlatiladi
- Umuman "tech dashboard" ko'rinishi bor, "luxury fashion" emas

## ✅ V2 Design Philosophy: Net-a-Porter / Mytheresa uslubi

### Asosiy tamoyillar:
1. **Toza fon** — gradient emas, oddiy `#0a0a0b`
2. **Minimal soyalar** — faqat `shadow-sm` yoki hech narsa
3. **Chegara emas, bo'sh joy** — `border` o'rniga `spacing`
4. **Tipografiya birinchi** — katta shrift, ko'p whitespace
5. **Oddiy kartalar** — `rounded-xl` (2rem emas), oddiy fon
6. **Hammasi ko'rinadi** — collapsible yo'q, hamma narsa ochiq

---

## 📐 Product Detail `/product/:id` — Yangi Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Orqaga                    Premium Selection  ✦   │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│                      │  Kategoriya                  │
│                      │                              │
│    [Rasm Gallery]    │  PRODUCT NAME                │
│    aspect-[3/4]      │  ★★★★☆ 4.5 | 12 sharh       │
│    rounded-xl        │                              │
│    no wrapper        │  1 200 000 so'm              │
│    no gradients      │  1 500 000 so'm (chizilgan)  │
│                      │                              │
│                      │  Tavsif matni shu yerda...   │
│                      │                              │
│                      │  ─── Rang ───                │
│                      │  ⚫ ⚪ 🔵                     │
│                      │                              │
│                      │  ─── O'lcham ───  [Jadval]   │
│                      │  S  M  L  XL                  │
│                      │                              │
│                      │  ─── Soni ───  Jami: ---     │
│                      │  [- 1 +]                     │
│                      │                              │
│                      │  [  Savatga qo'shish  ]      │
│                      │                              │
│                      │  🚚 3-6 soat  🛡 30 kun      │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│                                                     │
│  O'xshash mahsulotlar                               │
│  [Card 1]  [Card 2]  [Card 3]                      │
│                                                     │
│  Mijozlar fikrlari                                  │
│  [Review Form]  [Review List]                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### CSS Changes:
- **Grid**: `lg:grid-cols-2` (50/50 equal split)
- **Image**: `rounded-xl` (not 2rem), no wrapper gradients, no inner shadows
- **Right panel**: Single `div` (no article zones), clean `bg-[#0a0a0b]` (no gradient)
- **Separators**: `border-b border-white/5` between sections
- **No decorative glows**: Remove all `pointer-events-none` divs
- **No collapsible**: Everything open, well-spaced

---

## 📐 Products Listing `/products` — Yangi Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         Premium Katalog                             │
│    Eksklyuziv premium kiyimlar to'plami             │
│    42 mahsulot • 5 kategoriya                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Filtrlar]  Barchasi  Ko'ylaklar  Paltolar  ...   │
│                                      Saralash: ▼    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐               │
│  │     │  │     │  │     │  │     │               │
│  │ img │  │ img │  │ img │  │ img │               │
│  │     │  │     │  │     │  │     │               │
│  └─────┘  └─────┘  └─────┘  └─────┘               │
│  Name     Name     Name     Name                    │
│  Price    Price    Price    Price                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### CSS Changes:
- **Hero**: Minimal — title, subtitle, count. No animated blobs, no grid pattern.
- **Filter bar**: Clean pills, no backdrop-blur complexity
- **Cards**: Simple `rounded-xl`, no gradient overlays, clean hover scale

---

## 🎨 Design Tokens (o'zgarishsiz qoladi)

| Token | Value |
|-------|-------|
| bg-base | `#0a0a0b` |
| bg-card | `#141416` |
| text-primary | `#f5f5f3` |
| text-secondary | `#8a8a8d` |
| text-muted | `#6b6b6e` |
| accent-gold | `#c9a96e` |
| border | `rgba(255,255,255,0.08)` |

---

## 📁 Files to Rewrite

| # | File | Action |
|---|------|--------|
| 1 | `ProductView.js` | Full rewrite — clean layout |
| 2 | `ProductHero.js` | Full rewrite — minimal header |
| 3 | `PremiumProductCard.js` | Full rewrite — clean card |
| 4 | `ImageCarousel.js` | Simplify — remove heavy styling |
| 5 | `AllProducts.js` | Minor — match new aesthetic |
