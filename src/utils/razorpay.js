/**
 * Loads the Razorpay checkout script and resolves when window.Razorpay is ready.
 * Safe to call multiple times — reuses the existing script tag.
 */
export const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('Not in browser')); return; }
    if (window.Razorpay) { resolve(); return; }

    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      // Script tag exists but not yet loaded — wait for it
      existing.addEventListener('load',  () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.src   = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Razorpay script failed to load'));
    document.head.appendChild(script);
  });
