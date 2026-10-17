import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../contexts/ProductContext';
import { CONTACT } from '../config/policies';

const Footer = ({ variant = 'default' }) => {
  const { t } = useLanguage();
  // Categories come from the live catalogue so the footer never links to empty pages.
  const { categories = [] } = useProducts();
  const isEditorial = variant === 'editorial';

  const palette = isEditorial
    ? {
        footer: 'bg-[#171411] border-t border-[#7a5a34]/45',
        heading: 'text-[#f4efe7]',
        body: 'text-[#d7c7b3]',
        brand: 'text-[#f4efe7]',
        muted: 'text-[#b9a48c]',
        label: 'text-[#8b7358]',
        accentBorder: 'border-[#b38752]',
        accentText: 'text-[#d6b47c]',
        hoverAccent: 'hover:text-[#d6b47c]',
        iconShell: 'bg-[#241c17]',
        social: 'bg-[#201814] border border-[#7a5a34]/40 text-[#d7c7b3] hover:bg-[#2a201b] hover:text-[#f4efe7]',
        card: 'rounded-2xl border border-[#7a5a34]/35 bg-[#211915] p-6 space-y-6',
        bottomBorder: 'border-[#7a5a34]/35',
      }
    : {
        footer: 'bg-transparent border-t border-white/5',
        heading: 'text-white',
        body: 'text-[#a1a1aa]',
        brand: 'text-white',
        muted: 'text-[#71717a]',
        label: 'text-[#666]',
        accentBorder: 'border-[#d6b47c]',
        accentText: 'text-[#d6b47c]',
        hoverAccent: 'hover:text-[#d6b47c]',
        iconShell: 'bg-[#1a1525]',
        social: 'bg-white/5 border border-white/5 text-[#a1a1aa] hover:bg-white/10 hover:text-white',
        card: 'rounded-2xl border border-white/5 bg-[#100c14]/50 p-6 space-y-6',
        bottomBorder: 'border-white/5',
      };

  return (
    <footer id="footer" className={palette.footer}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <img src="/logoweb.png" alt="Logo" className="w-9 h-9 object-contain" />
              <span className={`${palette.brand} font-serif text-2xl tracking-wide`}>LUXX</span>
            </div>
            <p className={`${palette.body} text-[13px] leading-relaxed max-w-sm`}>
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 text-center md:text-left">
            <h3 className={`${palette.heading} text-[15px] font-medium tracking-wide mb-6 pl-3 border-l-2 ${palette.accentBorder} inline-block`}>{t('footer.quickLinks')}</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className={`text-[13px] ${palette.body} ${palette.hoverAccent} transition-colors`}>
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className={`text-[13px] ${palette.body} ${palette.hoverAccent} transition-colors`}>
                  Premium ayollar kiyimlari
                </Link>
              </li>
              <li>
                <Link to="/blog" className={`text-[13px] ${palette.body} ${palette.hoverAccent} transition-colors`}>
                  Moda va uslub blogi
                </Link>
              </li>
              <li>
                <Link to="/#new-collection" className={`text-[13px] ${palette.body} ${palette.hoverAccent} transition-colors`}>
                  {t('footer.newCollection')}
                </Link>
              </li>
              <li>
                <Link to="/about" className={`text-[13px] ${palette.body} ${palette.hoverAccent} transition-colors`}>
                  {t('footer.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2 text-center md:text-left">
            <h3 className={`${palette.heading} text-[15px] font-medium tracking-wide mb-6 pl-3 border-l-2 ${palette.accentBorder} inline-block`}>{t('footer.categories')}</h3>
            <ul className="space-y-4">
              {categories.slice(0, 6).map((category) => (
                <li key={category}>
                  <Link
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className={`text-[13px] ${palette.body} ${palette.hoverAccent} transition-colors`}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Card */}
          <div className="lg:col-span-4 text-center md:text-left">
            <h3 className={`${palette.heading} text-[15px] font-medium tracking-wide mb-6`}>{t('footer.contact')}</h3>
            <div className={palette.card}>
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${palette.iconShell}`}>
                  <MapPin className={`w-4 h-4 ${palette.accentText}`} />
                </div>
                <div className="text-left mt-1">
                  <p className={`text-[10px] uppercase tracking-widest ${palette.label} mb-1`}>{t('footer.address')}</p>
                  <p className={`text-[13px] ${palette.heading} leading-relaxed`}>
                    {t('footer.addressValue')}<br />{t('footer.addressStreet')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${palette.iconShell}`}>
                  <Phone className={`w-4 h-4 ${palette.accentText}`} />
                </div>
                <div className="text-left mt-1">
                  <p className={`text-[10px] uppercase tracking-widest ${palette.label} mb-1`}>{t('footer.phone')}</p>
                  <a href={CONTACT.phoneHref} className={`text-[13px] ${palette.heading} ${palette.hoverAccent}`}>
                    {CONTACT.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${palette.iconShell}`}>
                  <Mail className={`w-4 h-4 ${palette.accentText}`} />
                </div>
                <div className="text-left mt-1">
                  <p className={`text-[10px] uppercase tracking-widest ${palette.label} mb-1`}>{t('footer.email')}</p>
                  <a href={`mailto:${CONTACT.email}`} className={`text-[13px] ${palette.heading} ${palette.hoverAccent}`}>
                    {CONTACT.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t ${palette.bottomBorder} mt-16 pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`${palette.muted} text-[11px] tracking-wide`}>
              {t('footer.copyright')}
            </p>
            <div className="flex space-x-8">
              <Link to="/privacy-policy" className={`${palette.muted} ${palette.hoverAccent} text-[12px] transition-colors`}>
                {t('footer.privacyPolicy')}
              </Link>
              <Link to="/terms" className={`${palette.muted} ${palette.hoverAccent} text-[12px] transition-colors`}>
                {t('footer.terms')}
              </Link>
              <Link to="/contact" className={`${palette.muted} ${palette.hoverAccent} text-[12px] transition-colors`}>
                {t('footer.delivery')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
