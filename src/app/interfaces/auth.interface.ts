import { IApiSuccess, IUser } from './shared.interface';

export interface IAuthLogin {
  email: string;
  password: string;
}

export interface IAuthToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface IAuthLoginResponse extends IApiSuccess<{ user: IUser; token: string }> {}
export interface IAuthMeResponse extends IApiSuccess<IUser> {}
