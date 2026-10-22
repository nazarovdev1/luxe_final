import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';
import { BUNDLES_LABEL } from '../../config/navigation';
import { BundleList, BundlesIntro } from '../Bundles';

const MobileBundles = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const label = BUNDLES_LABEL[language] || BUNDLES_LABEL.uz;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bundles-page bundles-page--mobile">
            <SEO title={`${label} | Luxx.uz`} canonicalPath="/bundles" />

            <div className="bundles-mobile-bar">
                <button type="button" onClick={() => navigate(-1)} aria-label="Orqaga">
                    <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <span>{label}</span>
            </div>

            <BundlesIntro />
            <BundleList basePath="/mobile" />
        </div>
    );
};

export default MobileBundles;
