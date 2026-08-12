import React from 'react';
import './loading.css';

const Loading = () => {
    return (
        <div className="luxury-loader" role="status" aria-label="Luxx yuklanmoqda">
            <div className="luxury-loader__grain" aria-hidden="true" />
            <div className="luxury-loader__halo luxury-loader__halo--one" aria-hidden="true" />
            <div className="luxury-loader__halo luxury-loader__halo--two" aria-hidden="true" />
            <div className="luxury-loader__topline">
                <span>LUXX ATELIER</span>
                <span>EST. 2026</span>
            </div>
            <div className="luxury-loader__identity">
                <span className="luxury-loader__eyebrow">PRIVATE COLLECTION · TASHKENT</span>
                <div className="luxury-loader__wordmark" aria-hidden="true">
                    <span>LU</span><i>X</i><span>X</span>
                </div>
                <p>Every woman, her own signature.</p>
            </div>
            <div className="luxury-loader__bottomline">
                <span className="luxury-loader__rail" aria-hidden="true"><i /></span>
                <span>ATELIER TAYYORLANMOQDA</span>
                <b>00<span>/</span>100</b>
            </div>
        </div>
    );
};

export default Loading;
