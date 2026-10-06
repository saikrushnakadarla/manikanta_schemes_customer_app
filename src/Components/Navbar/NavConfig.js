// // Shared navigation config – put this file in src/ (or any shared folder) and fix the import paths if needed.
// // Change these values to match your real routes / numbers.

// export const HOME_ROUTE = '/products';      // the page that shows banner, categories, rates, products
// export const PROFILE_ROUTE = '/profile';
// export const WHATSAPP_NUMBER = '910000000000'; // TODO: replace with your WhatsApp number (country code + number)

// // Pages where the bottom bar should NOT show (login / signup etc.)
// export const BOTTOM_NAV_HIDDEN_PATHS = ['/', '/login', '/signup', '/register'];

// export const ROUTES = {
//   notifications: '/notifications',
//   editProfile: '/edit-profile',
//   savedAddress: '/saved-address',
//   orders: '/orders',
//   customOrders: '/custom-orders',
//   wishlist: '/wishlist',
//   cart: '/cartpage',
//   dashboard: '/dashboard',
//   schemes: '/schemes',
//   about: '/about',
//   contact: '/contact'
// };

// // Builds the URL used by the sidebar / tiles to open the home page filtered by category + sub category
// export const buildHomeFilterUrl = (category, sub) => {
//   const p = new URLSearchParams();
//   if (category) p.set('category', category);
//   if (sub) p.set('sub', sub);
//   return `${HOME_ROUTE}?${p.toString()}`;
// };

// export const getStoredUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem('user') || '{}') || {};
//   } catch (e) {
//     return {};
//   }
// };

// export const getUserName = () => {
//   const u = getStoredUser();
//   return u.name || u.customer_name || u.full_name || u.first_name || u.username || 'Guest';
// };
 


// Shared navigation config.
// Guests use GUEST_HOME_ROUTE ('/'), logged-in users use LOGGED_IN_HOME_ROUTE ('/products').

export const LOGGED_IN_HOME_ROUTE = '/products'; // banner, categories, rates, products (members)
export const GUEST_HOME_ROUTE = '/';              // same layout, but cart/wishlist ask to register
export const HOME_ROUTE = LOGGED_IN_HOME_ROUTE;   // kept for old imports
export const PROFILE_ROUTE = '/profile';
export const WHATSAPP_NUMBER = '910000000000'; // TODO: replace with your WhatsApp number (country code + number)

// Pages where the bottom bar should NOT show (login / signup etc.)
// NOTE: '/' is intentionally NOT here any more – the guest home lives there and needs the bar.
export const BOTTOM_NAV_HIDDEN_PATHS = ['/login', '/signup', '/register', '/customerregister'];

export const ROUTES = {
  notifications: '/notifications',
  editProfile: '/edit-profile',
  savedAddress: '/saved-address',
  orders: '/orders',
  customOrders: '/custom-orders',
  wishlist: '/wishlist',
  cart: '/cartpage',
  dashboard: '/dashboard',
  schemes: '/schemes',
  about: '/about',
  contact: '/contact'
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}') || {};
  } catch (e) {
    return {};
  }
};

// A user counts as logged in if any customer id is stored
export const isLoggedIn = () => {
  const u = getStoredUser();
  if (u && (u.id || u.customer_id || u.user_id)) return true;
  return !!(
    localStorage.getItem('customerId') ||
    localStorage.getItem('customer_id') ||
    localStorage.getItem('userId')
  );
};

// Home page for the current visitor
export const getHomeRoute = () => (isLoggedIn() ? LOGGED_IN_HOME_ROUTE : GUEST_HOME_ROUTE);

// Builds the URL used by the sidebar / tiles to open the home page filtered by category + sub category
export const buildHomeFilterUrl = (category, sub) => {
  const p = new URLSearchParams();
  if (category) p.set('category', category);
  if (sub) p.set('sub', sub);
  return `${getHomeRoute()}?${p.toString()}`;
};

export const getUserName = () => {
  const u = getStoredUser();
  return u.name || u.customer_name || u.full_name || u.first_name || u.username || 'Guest';
};