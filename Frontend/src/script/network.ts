export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  shopName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  error?: string;
}

const base_url:string='http://localhost:3000'

export const login = async (payload: LoginPayload): Promise<string> => {
  const response = await fetch(`${base_url}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  if (!data.token) {
    throw new Error('No token received from server');
  }

  return data.token;
};

export const register = async (payload: RegisterPayload): Promise<string> => {
  const response = await fetch(`${base_url}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  if (!data.token) {
    throw new Error('No token received from server');
  }

  return data.token;
};