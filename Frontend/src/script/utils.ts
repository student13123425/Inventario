export function getToken(): string {
  return localStorage.getItem('token') || '';
}