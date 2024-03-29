import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { RefreshItem } from './refreshTypes';

export interface AccessTokenPayload extends JwtPayload {
  id: Types.ObjectId;
  firstName: string;
  email: string;
  avatar: string;
  admin: boolean;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  id: Types.ObjectId;
  globalUserID: Types.ObjectId;
  iat: number;
  exp: number;
}

export interface AccessToken extends Object {
  id: Types.ObjectId | string;
  firstName: string;
  email: string;
  avatar: string;
  admin: boolean;
  iat?: number;
  exp?: number;
  _doc?: AccessTokenPayload;
}

export interface RefreshToken extends Object {
  _id: Types.ObjectId;
  globalUserID: Types.ObjectId;
  iat: number;
  exp: number;
  _doc: RefreshItem;
}

export interface SignedInState {
  accessToken: string;
  refreshToken: string;
}

export interface ProviderToken {
  iat: number;
  exp: number;
  email: string;
}

export interface FirebaseIdentitiesProps {
  'google.com': string[];
  email: string[];
}

interface FirebaseProps {
  identities: FirebaseIdentitiesProps;
  sign_in_provider: string;
}

export interface GoogleToken extends ProviderToken {
  name: string;
  picture: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  email_verified: number;
  firebase: FirebaseProps;
}

export interface GoogleTokenSignature {
  alg: string;
  kid: string;
  typ: string;
}
