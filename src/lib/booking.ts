/**
 * Clinic booking currently runs on book.flourishcare.id (already in production).
 * Every "Booking" button in the app opens that site. The in-app booking flow
 * (screens/BookingScreen.tsx) is kept intact: set VITE_BOOKING_URL to an empty
 * string at build time to switch back to it.
 */
const configured = import.meta.env.VITE_BOOKING_URL;
export const EXTERNAL_BOOKING_URL: string = configured === undefined ? 'https://book.flourishcare.id/' : configured;
export const USE_EXTERNAL_BOOKING = EXTERNAL_BOOKING_URL.trim().length > 0;

export function externalBookingHref(): string {
  try {
    const url = new URL(EXTERNAL_BOOKING_URL);
    url.searchParams.set('utm_source', 'flourishcare_app');
    url.searchParams.set('utm_medium', 'app');
    return url.toString();
  } catch {
    return EXTERNAL_BOOKING_URL;
  }
}

/** Opens the booking site in a new tab (or in place when pop-ups are blocked, as in some installed PWAs). */
export function openExternalBooking() {
  const href = externalBookingHref();
  // Note: passing 'noopener' makes window.open return null, so detach the opener manually instead
  const win = window.open(href, '_blank');
  if (win) {
    try {
      win.opener = null;
    } catch {
      /* cross-origin, already detached */
    }
  } else {
    window.location.assign(href);
  }
}
