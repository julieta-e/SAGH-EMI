import { C } from '../constants/colors';

export const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: 13,
  color: C.navy,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#f8fafc',
};

export const btnPrimary = {
  background: C.navy,
  color: 'white',
  border: 'none',
  borderRadius: 7,
  padding: '8px 18px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

export const btnSmall = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: 5,
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: 12,
  color: C.navy,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};
