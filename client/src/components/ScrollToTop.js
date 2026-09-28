import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const action = useNavigationType();
    const previousPath = useRef(pathname);

    useEffect(() => {
        // Changing a filter or opening a look on this page must keep its position.
        if (previousPath.current === pathname) return;
        previousPath.current = pathname;
        // If the navigation is a POP action (back/forward button), 
        // we want to retain the scroll position, so don't scroll to top.
        if (action === 'POP') return;

        window.scrollTo(0, 0);
    }, [pathname, action]);

    return null;
};

export default ScrollToTop;
