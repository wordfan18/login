export class RegisterUserDTO {
    username: string;
    password: string;
    email: string;
  
    constructor(username: string, password: string, email: string) {
      if (!username || !password || !email) {
        throw new Error("Username, password, and email are required.");
      }
      this.username = username;
      this.password = password;
      this.email = email;
    }
  }
  