/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const deletePhotos = async (id, name, index) => {
  try {
    const url = `/api/v1/stairs/${id}/${name}`;

    const res = await axios({
      method: 'DELETE',
      url,
    });

    // if (res.data.status === 'success') {
    //   showAlert('success', 'Zdjęcie zostało usunięte!');
    // }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
