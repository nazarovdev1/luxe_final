import React from 'react';

// Quiet shimmer skeleton shown while a page's code is loading. It uses the same classes as
// the static skeleton in index.html, so a first visit moves from one to the other without a
// jump. It is deliberately not an "opening": pages play their own openings once they load.
const Loading = () => (
    <div className="boot" role="status" aria-label="Luxx yuklanmoqda">
        <div className="boot__bar">
            <span className="boot__s boot__logo" />
            <span className="boot__s boot__nav" />
        </div>
        <div className="boot__body">
            <span className="boot__s boot__kicker" />
            <span className="boot__s boot__title" />
            <span className="boot__s boot__title boot__title--short" />
            <span className="boot__s boot__line" />
        </div>
        <span className="boot__s boot__photo" />
    </div>
);

export default Loading;
