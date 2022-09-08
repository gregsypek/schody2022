/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const createPrice = async (data) => {
  try {
    const url = '/api/v1/price';

    const res = await axios({
      method: 'POST',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Nowy cennik utworzony!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
