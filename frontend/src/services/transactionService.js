import api from './api';

export async function getBalance() {
  const res = await api.get('/balance');
  return res.data;
}

export async function getTransactions() {
  const res = await api.get('/transactions');
  return res.data;
}

export async function createTransfer(data) {
  const res = await api.post('/transactions', data);
  return res.data;
}
