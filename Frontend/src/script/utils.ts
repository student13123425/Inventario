export function getToken(): string|null {
  return localStorage.getItem('authToken') || null;
}

export function setToken(token:string): void {
  localStorage.setItem('authToken', token)
}

export function deleteToken():void{
  localStorage.removeItem('authToken')
}