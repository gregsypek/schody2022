/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Jesteś zalogowany!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  const res = await axios({
    method: 'GET',
    url: '/api/v1/users/logout',
  });
  //we actually need to set it to true here, and that will then force a reload from the server and not from browser cache
  if (res.data.status === 'success') location.reload(true);
  try {
  } catch (err) {
    showAlert('error', 'Problem z wylogowaniem! Spróbuj później');
  }
};
