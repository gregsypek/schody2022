/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const deletePrice = async (dataId) => {
  try {
    const url = `/api/v1/price/${dataId}`;

    const res = await axios({
      method: 'DELETE',
      url,
      data: null,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Cennnik został usunięty!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
