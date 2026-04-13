export const PASSWORD_POLICY_MIN_LENGTH = 8

export const PASSWORD_POLICY_GUIDANCE =
  'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 chữ số.'

export interface PasswordPolicyChecks {
  hasMinimumLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  isValid: boolean
}

export function getPasswordPolicyChecks(password: string): PasswordPolicyChecks {
  const hasMinimumLength = password.length >= PASSWORD_POLICY_MIN_LENGTH
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  return {
    hasMinimumLength,
    hasUppercase,
    hasNumber,
    isValid: hasMinimumLength && hasUppercase && hasNumber,
  }
}
