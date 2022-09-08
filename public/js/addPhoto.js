/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const addPhoto = async (data, dataId) => {
  try {
    const url = `/api/v1/stairs/${dataId}`;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Nowe zdjęcia dodane!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
