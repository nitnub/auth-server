export type AuthProvider = 'www.google.com';

export interface OAuthRequest {
  idToken: string;
  provider: AuthProvider;
}

interface FirebaseError extends Error {
  message: string;
  name: string;
  status: string;
  statusCode: number;
}
export interface FirebaseErrorResponse extends Error {
  error: FirebaseError;
  message: string;
  stack: string;
  status: string;
  success: boolean;
}
