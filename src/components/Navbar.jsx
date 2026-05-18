'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, selectIsAuthenticated, selectUser } from '@/store/authSlice';
import LoginModal from './LoginModal';

const PARTNER_URL = process.env.NEXT_PUBLIC_PARTNER_URL || 'http://localhost:9124/';

const NAV_LINKS = [
  { label: 'Vehicles',  href: '/vehicles'  },
  { label: 'Campsites', href: '/campsites' },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Contact',   href: '/contact'   },
];

function getInitials(user) {
  if (!user) return 'U';
  if (user.name) return user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  if (user.mobile) return user.mobile.slice(-2);
  return 'U';
}

function getDisplayName(user) {
  if (!user) return null;
  if (user.name)   return user.name;
  if (user.email)  return user.email;
  if (user.mobile) return `+91 ${user.mobile}`;
  return null;
}

export default function Navbar() {
  const dispatch  = useDispatch();
  const router    = useRouter();
  const isAuth    = useSelector(selectIsAuthenticated);
  const user      = useSelector(selectUser);
  const pathname  = usePathname();
  const isHome    = pathname === '/';

  const [open,            setOpen]            = useState(false);
  const [showLogin,       setShowLogin]       = useState(false);
  const [scrolled,        setScrolled]        = useState(false);
  const [dropdown,        setDropdown]        = useState(false);
  const [mounted,         setMounted]         = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setPendingRedirect(e.detail?.redirect ?? null);
      setShowLogin(true);
    };
    window.addEventListener('luxor:require-login', handler);
    return () => window.removeEventListener('luxor:require-login', handler);
  }, []);

  useEffect(() => {
    if (!dropdown) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdown]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = () => {
    dispatch(clearCredentials());
    setDropdown(false);
    setOpen(false);
  };

  const handleLoginSuccess = () => {
    if (pendingRedirect) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
    }
  };

  const effectiveAuth = mounted && isAuth;
  const initials      = getInitials(user);
  const displayName   = getDisplayName(user);
  const solid         = scrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solid
            ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-8 h-8 shrink-0">
                <div className="absolute inset-0 bg-[#84cc16] rounded-lg blur-sm opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative w-8 h-8 bg-[#84cc16] rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 font-black text-base leading-none select-none">L</span>
                </div>
              </div>
              <span className={`font-black text-lg tracking-tight transition-colors duration-300 ${solid ? 'text-gray-900' : 'text-white'}`}>
                LUXOR
              </span>
            </Link>

            {/* ── Desktop nav links (centered) ── */}
            <ul className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((l) => {
                const isActive =
                  l.href === pathname ||
                  (l.href.startsWith('/') && !l.href.includes('#') && pathname.startsWith(l.href));
                return (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? solid
                            ? 'text-gray-900 bg-gray-100'
                            : 'text-white bg-white/15'
                          : solid
                            ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* ── Desktop right actions ── */}
            <div className="hidden md:flex items-center gap-2">
              {effectiveAuth ? (
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropdown(v => !v)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 ${
                      solid ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#84cc16] flex items-center justify-center shrink-0 font-black text-xs text-gray-900">
                      {initials}
                    </div>
                    {displayName && (
                      <span className={`text-sm font-medium max-w-[120px] truncate transition-colors ${solid ? 'text-gray-700' : 'text-white'}`}>
                        {displayName}
                      </span>
                    )}
                    <svg
                      className={`w-3.5 h-3.5 transition-all duration-200 ${dropdown ? 'rotate-180' : ''} ${solid ? 'text-gray-400' : 'text-white/60'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {dropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 bg-white border border-gray-100 shadow-xl shadow-black/10">
                      <div className="px-4 py-3.5 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#84cc16] flex items-center justify-center shrink-0 font-black text-sm text-gray-900">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            {user?.name && <p className="text-gray-900 font-semibold text-sm truncate">{user.name}</p>}
                            {user?.email && <p className="text-gray-400 text-xs truncate">{user.email}</p>}
                            {user?.mobile && !user?.email && (
                              <p className="text-gray-400 text-xs">+91 {user.mobile}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <DropdownLink href="/profile" icon="user" onClick={() => setDropdown(false)}>
                          My Profile
                        </DropdownLink>
                        <DropdownLink href="/bookings" icon="list" onClick={() => setDropdown(false)}>
                          My Bookings
                        </DropdownLink>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all text-left"
                        >
                          <LogoutIcon />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                    solid
                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Sign In
                </button>
              )}

              <Link
                href={PARTNER_URL}
                className="bg-[#84cc16] hover:brightness-105 text-gray-900 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                List Property
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setOpen(v => !v)}
              className={`md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl transition-colors ${
                solid ? 'hover:bg-gray-100' : 'hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-[1.5px] rounded-full transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[6.5px]' : ''} ${solid ? 'bg-gray-700' : 'bg-white'}`} />
              <span className={`block w-5 h-[1.5px] rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''} ${solid ? 'bg-gray-700' : 'bg-white'}`} />
              <span className={`block w-5 h-[1.5px] rounded-full transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[6.5px]' : ''} ${solid ? 'bg-gray-700' : 'bg-white'}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-gray-100 ${
            open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-4 space-y-1">
            {/* User strip */}
            {effectiveAuth && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#84cc16] flex items-center justify-center shrink-0 font-black text-sm text-gray-900">
                  {initials}
                </div>
                <div className="min-w-0">
                  {user?.name && <p className="text-gray-900 font-semibold text-sm truncate">{user.name}</p>}
                  <p className="text-gray-400 text-xs truncate">
                    {user?.email ?? (user?.mobile ? `+91 ${user.mobile}` : '')}
                  </p>
                </div>
              </div>
            )}

            {NAV_LINKS.map((l) => {
              const isActive = l.href === pathname;
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}

            <div className="h-px bg-gray-100 my-2" />

            {effectiveAuth ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  <UserIcon /> My Profile
                </Link>
                <Link href="/bookings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  <ListIcon /> My Bookings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all text-left">
                  <LogoutIcon /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setOpen(false); setShowLogin(true); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-800 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Sign In
              </button>
            )}

            <Link
              href={PARTNER_URL}
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-gray-900 bg-[#84cc16] hover:brightness-105 transition-all mt-1"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </nav>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
    </>
  );
}

/* ── Helpers ── */
function DropdownLink({ href, icon, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
    >
      {icon === 'user' ? <UserIcon /> : <ListIcon />}
      {children}
    </Link>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}
