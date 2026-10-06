import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import './Bottomnav.css';
import { PROFILE_ROUTE, WHATSAPP_NUMBER, BOTTOM_NAV_HIDDEN_PATHS, getHomeRoute, isLoggedIn } from './NavConfig';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d="M3 11.2 12 3.5l9 7.7V20a1 1 0 0 1-1 1h-5.2v-6.2H9.2V21H4a1 1 0 0 1-1-1z" fill="#3b82f6" />
    <path d="M12 3.5 2.6 11.6M12 3.5l9.4 8.1" stroke="#1d4ed8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.3" fill="#fff3d6" stroke="#f59e0b" strokeWidth="2.6" />
    <path d="m15.4 15.4 5 5" stroke="#d97706" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path fill="#25d366" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
    <path fill="#fff" d="M8.6 7.5c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .4.5.9 1.4 1.7 2.4 2.2.2.1.3.1.5-.1l.6-.7c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.4 0 .5-.2 1.1-.8 1.5-.5.4-1.2.5-1.9.3-3-.9-5-3.3-5.5-4.9-.2-.7 0-1.6.4-2.4z" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" fill="none" stroke="#7b3fb0" strokeWidth="2" />
    <path d="M4.5 20.5c.6-3.6 3.6-5.5 7.5-5.5s6.9 1.9 7.5 5.5" fill="none" stroke="#7b3fb0" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Global bottom navigation.
 * Renders into document.body through a portal so no parent transform/overflow can move it.
 * Logged-in users: Profile -> PROFILE_ROUTE.
 * Guests: Profile -> HOME_ROUTE?profile=1 (locked profile screen rendered by HomePage).
 */
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  const hidden = BOTTOM_NAV_HIDDEN_PATHS.includes(path);
  const home = getHomeRoute();

  // Keep page content from being hidden behind the fixed bar
  useEffect(() => {
    if (hidden) return undefined;
    const previous = document.body.style.paddingBottom;
    document.body.style.paddingBottom = 'calc(84px + env(safe-area-inset-bottom, 0px))';
    return () => {
      document.body.style.paddingBottom = previous;
    };
  }, [hidden]);

  if (hidden) return null;

  const params = new URLSearchParams(location.search);
  const isSearch = path === home && !!params.get('search');
  const guestProfile = path === home && params.get('profile') === '1';
  const isHome = path === home && !isSearch && !guestProfile;
  const isProfile = path === PROFILE_ROUTE || guestProfile;

  const openChat = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank', 'noopener,noreferrer');
  };

  const goProfile = () => {
    if (isLoggedIn()) {
      navigate(PROFILE_ROUTE);
    } else {
      navigate(`${home}?profile=1`, { state: { t: Date.now() } });
    }
  };

  const bar = (
    <nav className="bn-bar" aria-label="Primary">
      <div className="bn-inner">
        <button className={`bn-item ${isHome ? 'active' : ''}`} onClick={() => navigate(home)}>
          <HomeIcon />
          <span>Home</span>
        </button>

        <button
          className={`bn-item ${isSearch ? 'active' : ''}`}
          onClick={() => navigate(`${home}?search=1`, { state: { t: Date.now() } })}
        >
          <SearchIcon />
          <span>Search</span>
        </button>

        {/* <button className="bn-item" onClick={openChat}>
          <ChatIcon />
          <span>Chat</span>
        </button> */}

        <button className={`bn-item ${isProfile ? 'active' : ''}`} onClick={goProfile}>
          <ProfileIcon />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );

  return createPortal(bar, document.body);
};

export default BottomNav;