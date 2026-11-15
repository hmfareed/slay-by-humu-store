// Guest order access tokens kept on this device so a guest can pay for, track,
// and later link their orders to an account. Tokens are opaque bearer secrets.
import { API_URL } from './api';

const KEY = 'sbh_guest_orders';

export type GuestOrderRef = { orderId: string; orderNumber: string; token: string; createdAt: number };

export function getGuestOrders(): GuestOrderRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestOrder(ref: GuestOrderRef) {
  const list = getGuestOrders().filter((o) => o.orderId !== ref.orderId);
  list.unshift(ref);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
}

export function findGuestOrder(orderId: string) {
  return getGuestOrders().find((o) => o.orderId === orderId);
}

function removeGuestOrder(token: string) {
  localStorage.setItem(KEY, JSON.stringify(getGuestOrders().filter((o) => o.token !== token)));
}

// Explicitly attach ONE guest order (chosen by the customer) to the logged-in account.
// Deliberately not automatic: on a shared device another person's login must not
// absorb someone else's guest orders.
export async function claimGuestOrder(authToken: string, orderId: string): Promise<boolean> {
  const ref = findGuestOrder(orderId);
  if (!ref) return false;
  try {
    const res = await fetch(`${API_URL}/orders/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ token: ref.token }),
    });
    if (res.ok) removeGuestOrder(ref.token);
    return res.ok;
  } catch {
    return false;
  }
}
