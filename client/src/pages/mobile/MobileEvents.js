import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Camera,
  ChevronRight,
  Crown,
  Gift,
  Leaf,
  MessageSquare,
  Play,
  Radio,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';
import { eventNavItems, resolveNavLabel } from '../../config/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import './mobileExperiences.css';

const ICONS = {
  reels: Play,
  'style-feed': Users,
  challenges: Trophy,
  live: Radio,
  'vip-club': Crown,
  'eco-impact': Leaf,
  'gift-cards': Gift,
  blog: MessageSquare,
  Camera,
  Crown,
  Gift,
  Leaf,
  MessageSquare,
  Play,
  Radio,
  Swords,
};

const DISPLAY_COPY = {
  reels: {
    title: 'Reels',
    subtitle: 'Qisqa fashion videolar va trendlar',
  },
  'style-feed': {
    title: 'Community',
    subtitle: "Uslubingizni baham ko'ring va ilhom oling",
  },
  challenges: {
    title: 'Challenges',
    subtitle: "Qiziqarli challenge'larda ishtirok eting",
  },
  live: {
    title: 'Live',
    subtitle: 'Jonli efirlar va exclusive shoular',
  },
};

const CARD_STYLES = {
  reels: {
    card: 'border-[#b65b7f]/25 bg-[linear-gradient(145deg,rgba(92,33,58,.30),rgba(15,16,21,.96)_68%)]',
    iconWrap: 'border-[#d978a5]/55 bg-[#7d3e61]/15 text-[#e896bb] shadow-[0_0_24px_rgba(213,104,157,.16)]',
    line: 'bg-[#d978a5]',
    arrow: 'border-[#d978a5]/40 text-[#e896bb] hover:bg-[#d978a5]/15',
    glow: 'bg-[#d978a5]/10',
  },
  'style-feed': {
    card: 'border-[#6884ad]/25 bg-[linear-gradient(145deg,rgba(34,52,82,.29),rgba(15,16,21,.96)_68%)]',
    iconWrap: 'border-[#789bd1]/55 bg-[#506b9b]/15 text-[#91b5f1] shadow-[0_0_24px_rgba(101,143,214,.16)]',
    line: 'bg-[#789bd1]',
    arrow: 'border-[#789bd1]/40 text-[#91b5f1] hover:bg-[#789bd1]/15',
    glow: 'bg-[#789bd1]/10',
  },
  challenges: {
    card: 'border-[#5d8c78]/25 bg-[linear-gradient(145deg,rgba(25,66,54,.29),rgba(15,18,19,.96)_68%)]',
    iconWrap: 'border-[#74b899]/55 bg-[#3d7b61]/15 text-[#8dd0ae] shadow-[0_0_24px_rgba(87,180,132,.14)]',
    line: 'bg-[#74b899]',
    arrow: 'border-[#74b899]/40 text-[#8dd0ae] hover:bg-[#74b899]/15',
    glow: 'bg-[#74b899]/10',
  },
  live: {
    card: 'border-[#a65c5c]/25 bg-[linear-gradient(145deg,rgba(77,31,35,.30),rgba(20,15,18,.96)_68%)]',
    iconWrap: 'border-[#d97777]/55 bg-[#8e4545]/15 text-[#ed9696] shadow-[0_0_24px_rgba(224,103,103,.16)]',
    line: 'bg-[#d97777]',
    arrow: 'border-[#d97777]/40 text-[#ed9696] hover:bg-[#d97777]/15',
    glow: 'bg-[#d97777]/10',
  },
  'vip-club': {
    card: 'border-[#b89559]/25 bg-[linear-gradient(145deg,rgba(79,59,26,.28),rgba(18,17,15,.96)_68%)]',
    iconWrap: 'border-[#d6b47c]/55 bg-[#9d7735]/15 text-[#e3c38b] shadow-[0_0_24px_rgba(214,180,124,.16)]',
    line: 'bg-[#d6b47c]',
    arrow: 'border-[#d6b47c]/40 text-[#e3c38b] hover:bg-[#d6b47c]/15',
    glow: 'bg-[#d6b47c]/10',
  },
  'eco-impact': {
    card: 'border-[#5b9474]/25 bg-[linear-gradient(145deg,rgba(27,67,48,.28),rgba(14,18,17,.96)_68%)]',
    iconWrap: 'border-[#73bf90]/55 bg-[#43835b]/15 text-[#8fd1a7] shadow-[0_0_24px_rgba(87,190,124,.14)]',
    line: 'bg-[#73bf90]',
    arrow: 'border-[#73bf90]/40 text-[#8fd1a7] hover:bg-[#73bf90]/15',
    glow: 'bg-[#73bf90]/10',
  },
  'gift-cards': {
    card: 'border-[#a77e58]/25 bg-[linear-gradient(145deg,rgba(75,49,29,.28),rgba(19,17,15,.96)_68%)]',
    iconWrap: 'border-[#d2a06e]/55 bg-[#9d693a]/15 text-[#e4b98c] shadow-[0_0_24px_rgba(211,150,95,.14)]',
    line: 'bg-[#d2a06e]',
    arrow: 'border-[#d2a06e]/40 text-[#e4b98c] hover:bg-[#d2a06e]/15',
    glow: 'bg-[#d2a06e]/10',
  },
  blog: {
    card: 'border-[#a75e7f]/25 bg-[linear-gradient(145deg,rgba(73,34,55,.28),rgba(17,15,19,.96)_68%)]',
    iconWrap: 'border-[#d279a0]/55 bg-[#8e456b]/15 text-[#e5a0bd] shadow-[0_0_24px_rgba(210,121,160,.14)]',
    line: 'bg-[#d279a0]',
    arrow: 'border-[#d279a0]/40 text-[#e5a0bd] hover:bg-[#d279a0]/15',
    glow: 'bg-[#d279a0]/10',
  },
};

const DEFAULT_CARD_STYLE = {
  card: 'border-white/10 bg-white/[0.035]',
  iconWrap: 'border-white/20 bg-white/[0.04] text-[#d6b47c]',
  line: 'bg-[#d6b47c]',
  arrow: 'border-white/20 text-[#d6b47c] hover:bg-white/10',
  glow: 'bg-[#d6b47c]/10',
};

const ExploreCard = ({ item, t }) => {
  const Icon = ICONS[item.id] || ICONS[item.icon] || Sparkles;
  const style = CARD_STYLES[item.id] || DEFAULT_CARD_STYLE;
  const copy = DISPLAY_COPY[item.id];

  return (
    <Link
      to={item.mobilePath}
      aria-label={copy?.title || resolveNavLabel(item, t)}
      className={`group relative isolate flex min-h-[132px] min-w-0 flex-col overflow-hidden rounded-[15px] border p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,.22)] active:scale-[0.985] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#d6b47c] ${style.card}`}
    >
      <span className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${style.glow}`} />
      <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${style.iconWrap}`}>
        <Icon className="h-[18px] w-[18px] stroke-[1.45] transition-transform duration-200 group-hover:scale-105" />
      </span>
      <span className={`mt-2 h-px w-6 rounded-full opacity-80 ${style.line}`} />
      <h2 className="mt-2 min-w-0 pr-8 font-[Georgia,serif] text-[16px] leading-tight text-[#f6f1e8]">
        {copy?.title || resolveNavLabel(item, t)}
      </h2>
      <p className="mt-1 max-w-full pr-7 text-[10px] leading-[1.35] text-white/55">
        {copy?.subtitle || item.subtitle}
      </p>
      <span className={`absolute bottom-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border transition duration-200 group-hover:translate-x-0.5 ${style.arrow}`}>
        <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
};

const MobileEvents = () => {
  const { t } = useLanguage();

  return (
    <div className="mexp mexp--community min-h-screen overflow-x-hidden bg-[#030406] px-4 pb-[calc(7.25rem+env(safe-area-inset-bottom))] pt-[max(.9rem,env(safe-area-inset-top))] text-[#f7f1e8]">
      <div className="mx-auto w-full max-w-[430px]">
        <header className="flex items-center justify-between px-1">
          <Link to="/mobile" className="font-brilliant text-[21px] leading-none text-[#d6b47c] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#d6b47c]">
            {t('mobileEvents.logo')}
          </Link>
          <Link
            to="/mobile/profile"
            aria-label={t('mobileEvents.notifications_label')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-[#d6b47c] shadow-[0_0_18px_rgba(214,180,124,.08)] transition hover:border-[#d6b47c]/30 active:scale-95"
          >
            <Bell className="h-[17px] w-[17px] stroke-[1.45]" />
            <span className="absolute right-[7px] top-[6px] h-1.5 w-1.5 rounded-full bg-[#d6b47c] shadow-[0_0_7px_rgba(214,180,124,.9)]" />
          </Link>
        </header>

        <section className="relative mt-3 h-[166px] overflow-hidden rounded-[18px] border border-white/10 bg-[#07080b] shadow-[0_18px_48px_rgba(0,0,0,.34)]">
          <img
            src="/mobile_explore_background.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-100"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#07080b_0%,rgba(7,8,11,.92)_43%,rgba(7,8,11,.30)_66%,rgba(7,8,11,.03)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#07080b]/35 to-transparent" />
          <div className="relative z-10 flex h-full max-w-[68%] flex-col justify-center px-5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#d6b47c]/35 bg-black/25 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#d6b47c]">
              <Sparkles className="h-2.5 w-2.5" />
              {t('mobileEvents.explore_badge')}
            </span>
            <h1 className="mt-3 whitespace-nowrap font-[Georgia,serif] text-[22px] leading-[1.08] text-[#f7f1e8]">
              {t('mobileEvents.hero_title_line1')}<br />{t('mobileEvents.hero_title_line2')}
            </h1>
            <span className="mt-2 h-px w-5 bg-[#d6b47c]" />
            <p className="mt-2 max-w-[190px] text-[10px] leading-[1.45] text-white/60">
              {t('mobileEvents.hero_subtitle')}
            </p>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-2 gap-3" aria-label={t('mobileEvents.explore_section_label')}>
          {eventNavItems.map((item) => <ExploreCard key={item.id} item={item} t={t} />)}
        </section>

        <Link
          to="/mobile/bundles"
          className="group mt-3 flex min-h-[56px] items-center gap-3 rounded-[14px] border border-[#d6b47c]/25 bg-[linear-gradient(105deg,rgba(88,65,28,.26),rgba(255,255,255,.035))] px-3.5 text-[#f7f1e8] shadow-[0_10px_28px_rgba(0,0,0,.18)] transition hover:border-[#d6b47c]/45 active:scale-[0.99] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#d6b47c]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d6b47c]/45 bg-[#d6b47c]/10 text-[#d6b47c] shadow-[0_0_18px_rgba(214,180,124,.12)]">
            <Crown className="h-4 w-4 stroke-[1.4]" />
          </span>
          <span className="min-w-0 flex-1 text-[10px] leading-[1.35] text-white/70">
            <span className="block text-white/90">{t('mobileEvents.bundles_title')}</span>
            {t('mobileEvents.bundles_subtitle')}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#d6b47c] transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default MobileEvents;
