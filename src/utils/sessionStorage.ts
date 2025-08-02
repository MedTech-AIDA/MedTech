const SESSION_KEY = 'diagnosis_session_id';

export const storeSessionId = (sessionId: string) => {
  localStorage.setItem(SESSION_KEY, sessionId);
};

export const getSessionId = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const clearSessionId = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
}; 