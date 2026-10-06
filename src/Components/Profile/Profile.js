// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import './Profile.css';
// import baseURL from '../URL/BaseURL';
// import { ROUTES, HOME_ROUTE, getUserName } from '../Navbar/NavConfig';

// // Items shown under "MY ACCOUNT" = all the pages that used to be in the old navbar menu
// const ACCOUNT_ITEMS = [
//   { id: 'orders', title: 'Orders', desc: 'Access your complete order history here', icon: 'bi-bag-fill', color: '#2e7d32', route: ROUTES.orders },
//   { id: 'wishlist', title: 'Wishlist', desc: 'Discover the products in your wishlist', icon: 'bi-heart-fill', color: '#e91e63', route: ROUTES.wishlist },
//   { id: 'cart', title: 'Cart', desc: 'Manage all products added to your cart', icon: 'bi-cart-fill', color: '#1565c0', route: ROUTES.cart },
//   { id: 'dashboard', title: 'Dashboard', desc: 'Go to your dashboard', icon: 'bi-house-door-fill', color: '#00897b', route: ROUTES.dashboard },
//   { id: 'products', title: 'Products', desc: 'Browse our complete jewellery collection', icon: 'bi-grid-3x3-gap-fill', color: '#f4511e', route: HOME_ROUTE },
//   { id: 'schemes', title: 'Schemes', desc: 'View and manage your jewellery schemes', icon: 'bi-journal-bookmark-fill', color: '#8e24aa', route: ROUTES.schemes },
//   { id: 'about', title: 'About Us', desc: 'Know more about our jewellers', icon: 'bi-info-circle-fill', color: '#546e7a', route: ROUTES.about },
//   { id: 'contact', title: 'Contact Us', desc: 'Get in touch with us', icon: 'bi-headset', color: '#039be5', route: ROUTES.contact }
// ];

// const Profile = () => {
//   const navigate = useNavigate();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [biometric, setBiometric] = useState(() => localStorage.getItem('biometricEnabled') === 'true');

//   const toggleBiometric = () => {
//     const next = !biometric;
//     setBiometric(next);
//     localStorage.setItem('biometricEnabled', String(next));
//   };

//   const handleLogout = async () => {
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: "You are about to logout from your account!",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#5b2189',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Yes, logout!',
//       cancelButtonText: 'Cancel',
//       background: '#fff',
//       backdrop: true,
//       allowOutsideClick: false,
//       allowEscapeKey: true,
//     });

//     if (!result.isConfirmed) {
//       return;
//     }

//     const userData = JSON.parse(localStorage.getItem('user') || '{}');
//     const token = localStorage.getItem('token');

//     setIsLoggingOut(true);

//     Swal.fire({
//       title: 'Logging out...',
//       text: 'Please wait while we log you out',
//       allowOutsideClick: false,
//       allowEscapeKey: false,
//       showConfirmButton: false,
//       willOpen: () => {
//         Swal.showLoading();
//       }
//     });

//     try {
//       const response = await fetch(`${baseURL}/api/customer/logout/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': token ? `Bearer ${token}` : '',
//         },
//         body: JSON.stringify({
//           user_id: userData.id || userData.user_id || 0
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Logout API error:', errorData);
//       } else {
//         const data = await response.json().catch(() => ({}));
//         console.log('Logout successful:', data);
//       }
//     } catch (error) {
//       console.error('Error during logout API call:', error);
//     } finally {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');

//       Swal.close();

//       await Swal.fire({
//         title: 'Logged Out!',
//         text: 'You have been successfully logged out.',
//         icon: 'success',
//         timer: 1500,
//         showConfirmButton: false,
//         background: '#fff',
//       });

//       navigate('/');
//       setIsLoggingOut(false);
//     }
//   };

//   return (
//     <div className="profile-page">
//       <h1 className="profile-title">PROFILE</h1>

//       {/* User card */}
//       <div className="profile-card user-card">
//         <span className="user-bar"></span>
//         <span className="user-avatar">
//           <i className="bi bi-person-fill"></i>
//         </span>
//         <div className="user-text">
//           <span className="user-hi">Hi,</span>
//           <span className="user-name">{getUserName()}</span>
//         </div>
//         <button className="edit-btn" onClick={() => navigate(ROUTES.editProfile)}>
//           Edit profile
//         </button>
//       </div>

//       {/* Security */}
//       <h2 className="profile-section">SECURITY</h2>
//       <div className="profile-card security-card">
//         <span className="security-icon">
//           <i className="bi bi-person-bounding-box"></i>
//         </span>
//         <div className="security-text">
//           <span className="security-title">Enable Face Lock / Touch ID</span>
//           <span className="security-desc">Secure your app with biometric authentication</span>
//         </div>
//         <button
//           className={`switch ${biometric ? 'on' : ''}`}
//           onClick={toggleBiometric}
//           role="switch"
//           aria-checked={biometric}
//           aria-label="Enable Face Lock / Touch ID"
//         >
//           <span className="switch-knob"></span>
//         </button>
//       </div>

//       {/* My account */}
//       <h2 className="profile-section">MY ACCOUNT</h2>
//       <div className="account-list">
//         {ACCOUNT_ITEMS.map(item => (
//           <button
//             key={item.id}
//             className="profile-card account-item"
//             onClick={() => navigate(item.route)}
//           >
//             <span className="account-icon" style={{ background: item.color }}>
//               <i className={`bi ${item.icon}`}></i>
//             </span>
//             <span className="account-text">
//               <span className="account-title">{item.title}</span>
//               <span className="account-desc">{item.desc}</span>
//             </span>
//             <i className="bi bi-chevron-right account-arrow"></i>
//           </button>
//         ))}

//         <button
//           className="profile-card account-item logout-item"
//           onClick={handleLogout}
//           disabled={isLoggingOut}
//         >
//           <span className="account-icon" style={{ background: '#dc3545' }}>
//             <i className="bi bi-box-arrow-right"></i>
//           </span>
//           <span className="account-text">
//             <span className="account-title">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
//             <span className="account-desc">Sign out from your account</span>
//           </span>
//           <i className="bi bi-chevron-right account-arrow"></i>
//         </button>
//       </div>

//     </div>
//   );
// };

// export default Profile;
 


import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Profile.css';
import baseURL from '../URL/BaseURL';
import BottomNav from '../Navbar/Bottomnav';
import { ROUTES, HOME_ROUTE, getStoredUser, isLoggedIn } from '../Navbar/NavConfig';

// Items shown under "MY ACCOUNT" = all the pages that used to be in the old navbar menu
const ACCOUNT_ITEMS = [
  { id: 'orders', title: 'Orders', desc: 'Access your complete order history here', icon: 'bi-bag-fill', color: '#2e7d32', route: ROUTES.orders },
  { id: 'wishlist', title: 'Wishlist', desc: 'Discover the products in your wishlist', icon: 'bi-heart-fill', color: '#e91e63', route: ROUTES.wishlist },
  { id: 'cart', title: 'Cart', desc: 'Manage all products added to your cart', icon: 'bi-cart-fill', color: '#1565c0', route: ROUTES.cart },
  { id: 'dashboard', title: 'Dashboard', desc: 'Go to your dashboard', icon: 'bi-house-door-fill', color: '#00897b', route: ROUTES.dashboard },
  { id: 'products', title: 'Products', desc: 'Browse our complete jewellery collection', icon: 'bi-grid-3x3-gap-fill', color: '#f4511e', route: HOME_ROUTE },
  { id: 'schemes', title: 'Schemes', desc: 'View and manage your jewellery schemes', icon: 'bi-journal-bookmark-fill', color: '#8e24aa', route: ROUTES.schemes },
  { id: 'about', title: 'About Us', desc: 'Know more about our jewellers', icon: 'bi-info-circle-fill', color: '#546e7a', route: ROUTES.about },
  { id: 'contact', title: 'Contact Us', desc: 'Get in touch with us', icon: 'bi-headset', color: '#039be5', route: ROUTES.contact }
];

// Name shown on the profile card: tries every common field, then mobile / email
const getDisplayName = () => {
  const u = getStoredUser();
  const nested = u.customer || u.user || {};
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ');
  return (
    u.name ||
    u.customer_name ||
    u.full_name ||
    full ||
    u.username ||
    nested.name ||
    nested.customer_name ||
    u.mobile ||
    u.mobile_number ||
    u.phone ||
    u.email ||
    'Customer'
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [biometric, setBiometric] = useState(() => localStorage.getItem('biometricEnabled') === 'true');

  // Guests never see the real profile: send them to the locked profile on the guest home
  if (!isLoggedIn()) {
    return <Navigate to="/?profile=1" replace />;
  }

  const toggleBiometric = () => {
    const next = !biometric;
    setBiometric(next);
    localStorage.setItem('biometricEnabled', String(next));
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to logout from your account!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5b2189',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    const userData = getStoredUser();
    const token = localStorage.getItem('token');

    setIsLoggingOut(true);

    Swal.fire({
      title: 'Logging out...',
      text: 'Please wait while we log you out',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`${baseURL}/api/customer/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          user_id: userData.id || userData.user_id || 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Logout API error:', errorData);
      } else {
        const data = await response.json().catch(() => ({}));
        console.log('Logout successful:', data);
      }
    } catch (error) {
      console.error('Error during logout API call:', error);
    } finally {
      // Clear EVERY key that makes the app think someone is logged in
      ['token', 'user', 'customerId', 'customer_id', 'userId', 'cart'].forEach((k) =>
        localStorage.removeItem(k)
      );

      Swal.close();

      await Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#fff',
      });

      navigate('/');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">PROFILE</h1>

      {/* User card */}
      <div className="profile-card user-card">
        <span className="user-bar"></span>
        <span className="user-avatar">
          <i className="bi bi-person-fill"></i>
        </span>
        <div className="user-text">
          <span className="user-hi">Hi,</span>
          <span className="user-name">{getDisplayName()}</span>
        </div>
        <button className="edit-btn" onClick={() => navigate(ROUTES.editProfile)}>
          Edit profile
        </button>
      </div>

      {/* Security */}
      <h2 className="profile-section">SECURITY</h2>
      <div className="profile-card security-card">
        <span className="security-icon">
          <i className="bi bi-person-bounding-box"></i>
        </span>
        <div className="security-text">
          <span className="security-title">Enable Face Lock / Touch ID</span>
          <span className="security-desc">Secure your app with biometric authentication</span>
        </div>
        <button
          className={`switch ${biometric ? 'on' : ''}`}
          onClick={toggleBiometric}
          role="switch"
          aria-checked={biometric}
          aria-label="Enable Face Lock / Touch ID"
        >
          <span className="switch-knob"></span>
        </button>
      </div>

      {/* My account */}
      <h2 className="profile-section">MY ACCOUNT</h2>
      <div className="account-list">
        {ACCOUNT_ITEMS.map(item => (
          <button
            key={item.id}
            className="profile-card account-item"
            onClick={() => navigate(item.route)}
          >
            <span className="account-icon" style={{ background: item.color }}>
              <i className={`bi ${item.icon}`}></i>
            </span>
            <span className="account-text">
              <span className="account-title">{item.title}</span>
              <span className="account-desc">{item.desc}</span>
            </span>
            <i className="bi bi-chevron-right account-arrow"></i>
          </button>
        ))}

        <button
          className="profile-card account-item logout-item"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <span className="account-icon" style={{ background: '#dc3545' }}>
            <i className="bi bi-box-arrow-right"></i>
          </span>
          <span className="account-text">
            <span className="account-title">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            <span className="account-desc">Sign out from your account</span>
          </span>
          <i className="bi bi-chevron-right account-arrow"></i>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;