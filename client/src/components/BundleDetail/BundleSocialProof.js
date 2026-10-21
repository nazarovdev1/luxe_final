import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPolicyCopy } from '../../config/policies';

// Real service promises only: no live viewer counts or invented purchase numbers.
const BundleSocialProof = () => {
  const { language } = useLanguage();
  const policy = getPolicyCopy(language);
  const promises = [policy.tryOn, policy.delivery, policy.returns, policy.payment];

  return (
    <section className="bundle-social-proof py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-1 divide-y divide-white/[0.07] border-y border-white/[0.08] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {promises.map((promise) => (
            <li key={promise} className="flex items-start gap-3 px-5 py-5 text-[14px] leading-snug text-[#f5f5f3] sm:px-6">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#d6b47c]" strokeWidth={1.8} aria-hidden="true" />
              {promise}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BundleSocialProof;
