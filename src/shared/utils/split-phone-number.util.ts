export const splitPhoneNumber = (phoneNumber: string) => {
  const regex = /^\+(\d{1,3})(\d+)$/;
  const match = phoneNumber.match(regex);

  if (match) {
    const countryCode = match[1];
    const phone = match[2];
    return { countryCode, phone };
  }

  throw new Error('Invalid phone number format');
};
