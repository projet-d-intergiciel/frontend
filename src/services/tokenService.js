// src/services/tokenService.js
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';


// Choisit le bon storage
const getStorage = () => {

  const rememberMe =
    localStorage.getItem(REMEMBER_ME_KEY) === 'true';

  return rememberMe
    ? localStorage
    : sessionStorage;
};


// =========================
// SAVE TOKENS
// =========================

export const saveTokens = (
  accessToken,
  refreshToken,
  rememberMe = false
) => {

  const storage =
    rememberMe
      ? localStorage
      : sessionStorage;

  storage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  storage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken
  );

  if (rememberMe) {

    localStorage.setItem(
      REMEMBER_ME_KEY,
      'true'
    );

  } else {

    localStorage.removeItem(
      REMEMBER_ME_KEY
    );
  }
};


// =========================
// GET TOKENS
// =========================

export const getAccessToken = () => {

 return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
};

export const getRefreshToken = () => {

   return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY)
  );
};


// =========================
// REMOVE TOKENS
// =========================

export const removeTokens = () => {

  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  sessionStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  sessionStorage.removeItem(
    REFRESH_TOKEN_KEY
  );
};


// =========================
// USER
// =========================

export const saveUser = (
  user,
  rememberMe = false
) => {

  const storage =
    rememberMe
      ? localStorage
      : sessionStorage;

  storage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};


export const getUser = () => {

  const userStr =
    localStorage.getItem(USER_KEY)
    || sessionStorage.getItem(USER_KEY);

  if (!userStr) return null;

  try {

    return JSON.parse(userStr);

  } catch {

    return null;
  }
};


export const removeUser = () => {

  localStorage.removeItem(USER_KEY);

  sessionStorage.removeItem(USER_KEY);
};


// =========================
// CLEAR AUTH
// =========================

export const clearAuth = () => {

  removeTokens();

  removeUser();

  localStorage.removeItem(
    REMEMBER_ME_KEY
  );
};