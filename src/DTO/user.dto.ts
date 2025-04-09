export interface createUserDTO {
  username: string;
  email: string;
  password: string;
  name?: string;
  isAdmin?: boolean | string;
  profileImage?: string;
}

export interface updateUserDTO {
  username?: string;
  email?: string;
  name?: string;
  profileImage?: string;
}
