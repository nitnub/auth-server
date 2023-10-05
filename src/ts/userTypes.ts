export default interface GlobalUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  admin: boolean;
  active: boolean;
  created?: Date;
  authProvider?: string;
  isValidPassword?(password: string): Promise<Error | boolean>;
}
