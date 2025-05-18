export type ValidationError = {
    email?: string;
    password?: string;
    };

function isValidEmail(value: string) {
  return value && value.includes('@');
}

function isValidPassword(value: string) {
  return value && value.trim().length >= 7;
}

export function validateCredentials(input: {email: string; password: string}) {
  let validationErrors: ValidationError = {};

  if (!isValidEmail(input.email)) {
    validationErrors.email = 'Invalid email address.'
  }

  if (!isValidPassword(input.password)) {
    validationErrors.password = 'Invalid password. Must be at least 7 characters long.'
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors;
  }
}