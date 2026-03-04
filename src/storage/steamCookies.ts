let cookies: string[] = [];

export const getCookies = () => cookies;

export const setCookies = (newCookies: string[]) => {
  cookies = newCookies;
};

export const clearCookies = () => {
  cookies = [];
};
