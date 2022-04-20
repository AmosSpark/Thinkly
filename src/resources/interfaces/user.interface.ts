interface IUserDocument {
  fullName: string;
  email: string;
  password: string;
  photo?: string;
  photoId?: string;
  headline?: string;
  bio?: string;
  role?: string;
  active?: boolean;
}

interface IUserLogin {
  email: string;
  password: string;
}

interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

export { IUserDocument, IUserLogin, IChangePassword };
