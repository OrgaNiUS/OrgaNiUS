/**
 * username is 5-20 characters long
 * no _ or . at the beginning
 * no __ or _. or ._ or .. inside
 * Alphanumeric characters allowed + . + _ + space
 * no _ or . at the end
 */
export const validUsername: RegExp = /^(?=.{5,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z\d._ ]+(?<![_.])$/g

/**
 * Minimum eight and maximum 10 characters,
 * at least one uppercase letter,
 * one lowercase letter,
 * one number
 * and one special character
 */
export const validPassword: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/g

// Standard email regex
export const validEmail: RegExp = /^[a-zA-Z\d]+@[a-zA-Z\d]+\\.[A-Za-z]+$/g