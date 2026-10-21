import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getPolicyCopy } from '../../../config/policies';

// Real service promises only: no live viewer counts, purchase tickers or countdowns.
const MobileBundleSocialProof = () => {
    const { language } = useLanguage();
    const policy = getPolicyCopy(language);
    const promises = [policy.tryOn, policy.delivery, policy.returns, policy.payment];

    return (
        <ul className="px-5 mt-6 relative z-20 border-y border-white/[0.07] divide-y divide-white/[0.07]">
            {promises.map((promise) => (
                <li key={promise} className="flex items-start gap-3 py-3.5 text-[13px] leading-snug text-neutral-200">
                    <Check className="mt-0.5 w-4 h-4 shrink-0 text-[#d6b47c]" strokeWidth={1.8} aria-hidden="true" />
                    {promise}
                </li>
            ))}
        </ul>
    );
};

export default MobileBundleSocialProof;
