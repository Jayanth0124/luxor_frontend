'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated, clearCredentials } from '@/store/authSlice';
import ProfileHero from './ProfileHero';
import AccountDetails from './AccountDetails';
import BookingsTab from './BookingsTab';
import SecurityCard from './SecurityCard';

const Spinner = () => (
  <div className="bg-white min-h-screen pt-16 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
  </div>
);

const NAV_ITEMS = [
  {
    key:   'profile',
    label: 'My Profile',
    icon:  (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key:   'bookings',
    label: 'My Bookings',
    icon:  (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key:   'security',
    label: 'Security',
    icon:  (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export default function ProfileContent() {
  const router   = useRouter();
  const sp       = useSearchParams();
  const dispatch = useDispatch();
  const isAuth   = useSelector(selectIsAuthenticated);
  const user     = useSelector(selectUser);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const initTab = sp.get('tab') === 'bookings' ? 'bookings' : 'profile';
  const [tab, setTab] = useState(initTab);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuth) {
      window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: '/profile' } }));
      router.replace('/');
    }
  }, [isAuth, router, mounted]);

  if (!mounted) return <Spinner />;
  if (!isAuth)  return null;

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push('/');
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#f5f6f7' }}>
      <ProfileHero user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-600">My Account</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[248px_1fr] gap-5 items-start">
          <aside className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 px-5 pt-5 pb-3">
              My Account
            </p>

            <nav className="pb-2">
              {NAV_ITEMS.map(({ key, label, icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all border-l-2 ${
                      active
                        ? 'text-gray-900 bg-[#f0fdf4] border-[#84cc16]'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <span className={active ? 'text-[#65a30d]' : 'text-gray-400'}>{icon}</span>
                    {label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-gray-100 pt-2 pb-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </aside>

          <main>
            {tab === 'profile'  && <AccountDetails user={user} />}
            {tab === 'bookings' && <BookingsTab isAuth={isAuth} />}
            {tab === 'security' && <SecurityCard user={user} />}
          </main>
        </div>
      </div>
    </div>
  );
}
