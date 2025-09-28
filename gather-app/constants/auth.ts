export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

export type AuthFieldError = 
  | { message: string; field?: keyof LoginCredentials }
  | { message: string; field?: keyof RegisterCredentials }
  | { message: string; field?: undefined };

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}