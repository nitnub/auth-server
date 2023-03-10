import { Document } from 'mongoose';
export default interface GlobalUser  {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  admin: boolean;
  active: boolean;
  created?: Date;
  isValidPassword?(password: string): Promise<Error | boolean>;
}


