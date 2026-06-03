let warnedAboutJwtSecret = false;

const PASSWORD_MESSAGE =
  "A senha deve ter no minimo 8 caracteres, incluindo letra maiuscula, letra minuscula e numero";

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET precisa estar configurado em producao");
  }

  if (!warnedAboutJwtSecret) {
    console.warn("JWT_SECRET nao configurado. Usando segredo local apenas para desenvolvimento.");
    warnedAboutJwtSecret = true;
  }

  return "segredo";
}

function getPasswordValidationMessage(password) {
  if (typeof password !== "string") return PASSWORD_MESSAGE;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasUppercase && hasLowercase && hasNumber
    ? ""
    : PASSWORD_MESSAGE;
}

module.exports = {
  getJwtSecret,
  getPasswordValidationMessage,
  PASSWORD_MESSAGE
};
