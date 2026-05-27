export const PASSWORD_REQUIREMENT_MESSAGE =
  "Use no minimo 8 caracteres, com letra maiuscula, letra minuscula e numero.";

export function getPasswordError(password: string, label = "A senha") {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (hasMinLength && hasUppercase && hasLowercase && hasNumber) {
    return "";
  }

  return PASSWORD_REQUIREMENT_MESSAGE.replace("Use", `${label} deve ter`);
}
