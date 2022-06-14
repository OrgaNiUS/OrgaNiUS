/**
 * Must be unique
 * At least 5 characters long
 * Only contains alphanumeric characters and ' ', '_', '.'
 */
export const validUsername: RegExp = /^[A-Za-z][A-Za-z\d_ .]{4,19}$/;

/**
 * At least 8 characters long
 * Contains at least 1 uppercase, 1 lowercase and 1 digit
 * Does not contain username(done in code, not in regex)
 */
export const validPassword: RegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

// Standard email regex
export const validEmail: RegExp =
  /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/;

// Only accepts 6 digit AlphaNumeric input
export const validPinCode: RegExp = /^[A-Z\d]{6}$/;
