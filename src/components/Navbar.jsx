'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, selectIsAuthenticated, selectUser } from '@/store/authSlice';
import LoginModal from './LoginModal';

const PARTNER_URL = process.env.NEXT_PUBLIC_PARTNER_URL || 'http://localhost:9124/';

// ── Added Home Navigation ──
const NAV_LINKS = [
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Campsites', href: '/campsites' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
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
  if (user.name) return user.name;
  if (user.email) return user.email;
  if (user.mobile) return `+91 ${user.mobile}`;
  return null;
}

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
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
  const initials = getInitials(user);
  const displayName = getDisplayName(user);
  const solid = scrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${solid
            ? 'bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-1'
            : 'bg-transparent border-b border-transparent py-3'
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group outline-none">
              <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${solid ? 'bg-[#84cc16] shadow-sm' : 'bg-[#84cc16] shadow-[0_0_20px_rgba(132,204,22,0.4)] group-hover:shadow-[0_0_25px_rgba(132,204,22,0.6)]'}`} />
                <span className="relative text-gray-900 font-black text-lg leading-none select-none z-10">L</span>
              </div>
              <span className={`font-black text-xl tracking-tight transition-colors duration-300 ${solid ? 'text-gray-900' : 'text-white'}`}>
                LUXOR
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <ul className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((l) => {
                const isActive =
                  l.href === pathname ||
                  (l.href !== '/' && pathname.startsWith(l.href));

                return (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className={`relative px-5 py-2 text-[13px] font-bold tracking-wide uppercase transition-all duration-300 group outline-none ${isActive
                          ? solid ? 'text-[#84cc16]' : 'text-white'
                          : solid ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'
                        }`}
                    >
                      {l.label}
                      {/* Premium Active Indicator */}
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-t-full transition-all duration-300 ${isActive
                          ? `w-4 ${solid ? 'bg-[#84cc16]' : 'bg-white'}`
                          : `w-0 group-hover:w-2 ${solid ? 'bg-gray-300' : 'bg-white/50'}`
                        }`} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* ── Desktop Right Actions ── */}
            <div className="hidden md:flex items-center gap-4">
              {effectiveAuth ? (
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropdown(v => !v)}
                    className={`flex items-center gap-3 rounded-full pl-2 pr-4 py-1.5 transition-all duration-300 border outline-none ${solid
                        ? 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5 bg-black/10 backdrop-blur-md'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#84cc16] flex items-center justify-center shrink-0 font-black text-xs text-gray-900 shadow-sm">
                      {initials}
                    </div>
                    {displayName && (
                      <span className={`text-xs font-bold max-w-[100px] truncate transition-colors ${solid ? 'text-gray-700' : 'text-white'}`}>
                        {displayName}
                      </span>
                    )}
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${dropdown ? 'rotate-180' : ''} ${solid ? 'text-gray-400' : 'text-white/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Premium Profile Dropdown */}
                  <div className={`absolute right-0 top-[calc(100%+8px)] w-64 rounded-[1.5rem] overflow-hidden z-50 bg-white/95 backdrop-blur-3xl border border-gray-100 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 origin-top-right ${dropdown ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#84cc16] flex items-center justify-center shrink-0 font-black text-sm text-gray-900 shadow-sm">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          {user?.name && <p className="text-gray-900 font-bold text-sm truncate">{user.name}</p>}
                          {user?.email && <p className="text-gray-500 font-medium text-xs truncate mt-0.5">{user.email}</p>}
                          {user?.mobile && !user?.email && (
                            <p className="text-gray-500 font-medium text-xs mt-0.5">+91 {user.mobile}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <DropdownLink href="/profile" icon="user" onClick={() => setDropdown(false)}>My Profile</DropdownLink>
                      <DropdownLink href="/bookings" icon="list" onClick={() => setDropdown(false)}>My Bookings</DropdownLink>
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left outline-none">
                        <LogoutIcon /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className={`text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 outline-none ${solid
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                >
                  Sign In
                </button>
              )}

              <Link
                href={PARTNER_URL}
                className="bg-[#84cc16] hover:bg-[#74b814] text-gray-900 text-[11px] uppercase tracking-widest font-black px-6 py-3 rounded-full transition-all shadow-[0_8px_20px_rgba(132,204,22,0.25)] hover:shadow-[0_12px_25px_rgba(132,204,22,0.35)] hover:-translate-y-0.5 outline-none"
              >
                List Property
              </Link>
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              onClick={() => setOpen(v => !v)}
              className={`md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-full transition-colors outline-none ${solid ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                }`}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''} ${solid ? 'bg-gray-900' : 'bg-white'}`} />
              <span className={`block w-5 h-[2px] rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''} ${solid ? 'bg-gray-900' : 'bg-white'}`} />
              <span className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''} ${solid ? 'bg-gray-900' : 'bg-white'}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Dropdown ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-2xl rounded-b-[2rem] ${open ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
            }`}
        >
          <div className="px-5 py-6 flex flex-col gap-2">
            {/* User Strip Mobile */}
            {effectiveAuth && (
              <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#84cc16] flex items-center justify-center shrink-0 font-black text-base text-gray-900 shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  {user?.name && <p className="text-gray-900 font-bold text-base truncate">{user.name}</p>}
                  <p className="text-gray-500 font-medium text-xs truncate mt-0.5">
                    {user?.email ?? (user?.mobile ? `+91 ${user.mobile}` : '')}
                  </p>
                </div>
              </div>
            )}

            {NAV_LINKS.map((l) => {
              const isActive = l.href === pathname || (l.href !== '/' && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors outline-none ${isActive ? 'text-[#84cc16] bg-[#84cc16]/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {l.label}
                </Link>
              );
            })}

            <div className="h-px bg-gray-100 my-4 mx-2" />

            {effectiveAuth ? (
              <div className="flex flex-col gap-2">
                <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors outline-none">
                  <UserIcon /> My Profile
                </Link>
                <Link href="/bookings" onClick={() => setOpen(false)} className="flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors outline-none">
                  <ListIcon /> My Bookings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left outline-none mt-2">
                  <LogoutIcon /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setOpen(false); setShowLogin(true); }}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-gray-900 border-2 border-gray-200 hover:border-gray-900 transition-colors outline-none"
              >
                Sign In
              </button>
            )}

            <Link
              href={PARTNER_URL}
              className="flex items-center justify-center px-5 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-gray-900 bg-[#84cc16] shadow-[0_8px_20px_rgba(132,204,22,0.25)] mt-4 outline-none"
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
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors outline-none"
    >
      {icon === 'user' ? <UserIcon /> : <ListIcon />}
      {children}
    </Link>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}