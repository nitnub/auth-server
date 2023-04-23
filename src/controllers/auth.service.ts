// @ts-nocheck
import { Request, Response } from 'express';
import GlobalUser from '../ts/userTypes';
import { RefreshItem } from '../ts/refreshTypes';
import AppError from '../utils/appError';
import AuthRepository from './auth.repository';
import { Types } from 'mongoose';
import getSecretString from '../utils/getSecretString';
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenTimestamps,
  verifyToken,
  verifyTokenGoogle,
} from '../utils/token';
import { RefreshToken, SignedInState } from 'ts/tokenTypes';

import Logger from '../libs/logger';

import { firebaseConfig } from '../utils/firebaseConfig';

import { initializeApp } from 'firebase-admin/app';
const { OAuth2Client } = require('google-auth-library');

class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }
  /**
   * Register a new user
   */

  addRefreshTokenToCookie = (
    // PER BELOW "SECURE" SETTINGS - PRODUCTION MODE WILL PRECLUDE COOKIES FROM SENDING TO POSTMAN!
    res: Response,
    refreshToken: string,
    refreshExpirationTime: number
  ) => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(refreshExpirationTime),
      maxAge: 15000,
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);
    console.log('cooooooooooooooo')
    console.log(res.header)
  };

  removeRefreshTokenFromCookie = (
    // PER BELOW "SECURE" SETTINGS - PRODUCTION MODE WILL PRECLUDE COOKIES FROM SENDING TO POSTMAN!
    res: Response
  ) => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
    };

    res.cookie('refreshToken', null, cookieOptions);
  };

  addRefreshEntryToDB = async (
    globalUserID: Types.ObjectId | string
  ): Promise<RefreshItem> => {
    const { iat, exp } = getTokenTimestamps();
    const refreshDetails = {
      globalUserID,
      iat,
      exp,
    };

    const refreshEntry = await this.authRepository.writeRefresh(refreshDetails);
    if (refreshEntry._doc === undefined) {
      throw new AppError('Unable to update refresh token.', 500);
    }

    return refreshEntry;
  };

  getsignedInState = async (
    user: GlobalUser,
    res: Response
  ): Promise<SignedInState> => {
    // Create new access token for this user.

    const accessToken = generateAccessToken(user);

    if (!user._id)
      throw new AppError('Unable to generate user access token', 500);

    // Add new refresh entry to DB
    const refreshEntry = await this.addRefreshEntryToDB(user._id);

    // generate refresh token and add to cookies
    if (!refreshEntry._doc)
      throw new AppError('Unable to parse refresh entry', 500);

    const refreshToken = generateRefreshToken(refreshEntry._doc);
    this.addRefreshTokenToCookie(res, refreshToken, refreshEntry.exp * 1000);

    return { accessToken, refreshToken };
  };

  register = async (
    user: GlobalUser,
    res: Response
  ): Promise<GlobalUser | void> => {
    // Add user to DB
    const createdUser = await this.authRepository.addUser(user);
    if (user.newUser) {
      createdUser.newUser = true;
    }
    // Sign in the new user. Return accessToken refreshToken is added to cookies.
    const { accessToken, refreshToken } = await this.getsignedInState(
      createdUser,
      res
    );

    const sanitizedUser = {
      id: createdUser._id!,
      firstName: createdUser.firstName,
      email: createdUser.email,
      avatar: createdUser.avatar,
      admin: createdUser.admin,
      authProvider: createdUser.authProvider || 'standard'
    };

    return { sanitizedUser, accessToken };
  };

  signin = async (email: string, password: string, res: Response) => {
    // verify fields are truthy
    if (!email || !password)
      throw new AppError('Please enter a username and password', 400);

    // verify user exists in db (via email) and password matches
    const user: GlobalUser | null =
      (await this.authRepository.findUserByEmail(email)) || null;

    if (!user || !(await user?.isValidPassword(password)))
      throw new AppError('Unable to verify user. Please try again.', 400);

    // const { accessToken, refreshToken } = await this.getsignedInState(
    const { accessToken } = await this.getsignedInState(user, res);

    // return { sanitizedUser, accessToken };
    return accessToken;
  };

  verifyGoogleToken = async (token: string, res: Response) => {
    const verifiedEntry = await verifyTokenGoogle(token);
    // Check for errors

    if (verifiedEntry instanceof Error) {
      Logger.error(verifiedEntry);
      throw new AppError(verifiedEntry.message, 400);
    }

    const { name, email, picture: avatar, email_verified } = verifiedEntry;

    // if email is not verified, exit...
    if (!email_verified) {
      throw new AppError('Unable to verify user.', 400);
    }

    // verify user exists in db (via email)
    let user: GlobalUser | null =
      (await this.authRepository.findUserByEmail(email)) || null;

    if (!user) {

      const fullName: string[] = name.split(' ') || [];
      const password = getSecretString();

      user = {
        firstName: fullName[0] || 'NoFirstName',
        lastName: fullName[1] || 'NoLastName',
        email,
        password,
        avatar: avatar || '/img/pic/mary.png',
        admin: false,
        active: true,
        newUser: true,
        authProvider: 'google'
      };

      const registeredUser = await this.register(user, res);
     
      return { newUser: true, accessToken: registeredUser.accessToken };

    } else {
      // Always be sure the most current avatar is used
      this.authRepository.updateAvatar(email, avatar);
    }


    const { accessToken } = await this.getsignedInState(user, res);
    return { newUser: false, accessToken };
    // return accessToken;
  };

  signout = async (
    signOutAll: boolean,
    refreshToken: string,
    res: Response
  ): Promise<object | void> => {
    // verify refresh token secret
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new AppError('Error generating refresh token', 400);
    }

    //TODO: REPLACE WITH... SEE CREATED METHOD IN TOKEN UTIL FOR VERIFY
    const decodedToken = await verifyToken<RefreshToken>(refreshToken);

    if (!decodedToken || decodedToken instanceof Error) {
      // return;
      throw new AppError('Unable to validate token', 400);
    }

    // delete refresh token from db
    const removed = signOutAll
      ? await this.authRepository.removeAllUserRefreshes(
          decodedToken.globalUserID
        )
      : await this.authRepository.removeOneRefresh(decodedToken._id);

    this.removeRefreshTokenFromCookie(res);

    return {
      status: 'success',
      removed: refreshToken,
    };
  };

  token = async (req: Request, res: Response): Promise<object | void> => {
    // receives request w/ refreshToken

    if (!req.cookies.refreshToken) {
      throw new AppError('No refresh token detected', 400);
    }

    const refreshTokenOld: string = req.cookies.refreshToken;

    // verify refresh token is valid; throws error if not
    const verifiedEntry = (await verifyToken(refreshTokenOld)) as RefreshToken;

    // check if user appears in Users collection
    const user = await this.authRepository.findUserByID(
      verifiedEntry.globalUserID
    );

    // // verify user was found
    if (!user)
      throw new AppError(
        'Unable to verify user details. Please try again.',
        400
      );

    // remove old refresh token from the db
    await this.authRepository.removeOneRefresh(verifiedEntry._id);

    const { accessToken, refreshToken } = await this.getsignedInState(
      user,
      res
    );

    return {
      accessToken,
      refreshToken,
      removedRefreshToken: refreshTokenOld,
    };
  };
}

export default AuthService;
