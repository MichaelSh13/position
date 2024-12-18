export {};

declare global {
  type WithEmail = {
    email: string;
  };

  type WithPhone = {
    phone: string;
    code: string;
  };

  type WithPassword = {
    password: string;
  };

  type CreateAccountData = Partial<WithEmail> &
    Partial<WithPhone> &
    WithPassword;

  type AccountIsActiveOptions = {
    verification?: boolean;
    error?: boolean;
    activated?: boolean;
  };
}
