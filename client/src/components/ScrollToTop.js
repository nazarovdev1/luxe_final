import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const action = useNavigationType();

    useEffect(() => {
        // If the navigation is a POP action (back/forward button), 
        // we want to retain the scroll position, so don't scroll to top.
        if (action === 'POP') return;

        window.scrollTo(0, 0);
    }, [pathname, action]);

    return null;
};

export default ScrollToTop;
