import Swal from 'sweetalert2';
// import { LOGIN_ROUTE } from './NavConfig';

// Shows "Login required" and sends the user to the login page when they confirm.
export const askLogin = (navigate, text = 'Please login to continue.') => {
  return Swal.fire({
    title: '🔒 Login Required',
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#5b2189',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Login',
    cancelButtonText: 'Cancel',
    background: '#fff',
    backdrop: 'rgba(0,0,0,0.6)'
  }).then((result) => {
    if (result.isConfirmed) {
    //   navigate(LOGIN_ROUTE);
    }
    return result;
  });
};
