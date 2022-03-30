interface IUserDocument {
  fullName: string;
  email: string;
  password: string;
  headline?: string;
  bio?: string;
  role?: string;
}

interface IUserLogin {
  email: string;
  password: string;
}

export { IUserDocument, IUserLogin };
