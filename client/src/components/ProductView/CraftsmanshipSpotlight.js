import React from 'react';
import { Award, Gem, Scissors } from 'lucide-react';

const details = [
  {
    number: '01',
    icon: Scissors,
    title: 'Mukammal bichim',
    text: "Siluetni nafis ko‘rsatadigan, harakatda erkinlik beruvchi aniq qolip.",
  },
  {
    number: '02',
    icon: Gem,
    title: 'Nozik yakunlar',
    text: 'Tugma, chok va bezaklar modelning har bir tomonidan ko‘rinadigan qilib tanlangan.',
  },
  {
    number: '03',
    icon: Award,
    title: 'Yoqimli mato',
    text: 'Teri bilan muloyim ishlaydigan va kun davomida shaklini saqlaydigan material.',
  },
];

export default function CraftsmanshipSpotlight() {
  return (
    <section className="clean-craft-section">
      <div className="clean-craft-intro">
        <p>MODEL DETALLARI</p>
        <h2>Ko‘rinadigan nafislik,<br />seziladigan sifat.</h2>
        <span>Har bir detal bir maqsad bilan tanlangan: siz o‘zingizni ishonchli va chiroyli his qilishingiz uchun.</span>
      </div>

      <div className="clean-craft-list">
        {details.map(({ number, icon: Icon, title, text }) => (
          <article key={number} className="clean-craft-item">
            <span className="clean-craft-number">{number}</span>
            <div className="clean-craft-icon"><Icon size={18} /></div>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
