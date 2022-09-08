/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const createStairs = async (data) => {
  try {
    const url = '/api/v1/stairs';

    const res = await axios({
      method: 'POST',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Nowa kategoria utworzona!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
