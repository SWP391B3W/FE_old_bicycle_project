export type RegisterRole = 'buyer' | 'seller'

export interface RegisterFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    confirmPassword: string
    role: RegisterRole
    agreeTerms: boolean
}

export interface RegisterPasswordChecks {
    isPasswordValid: boolean
    hasUppercase: boolean
    hasNumber: boolean
    passwordsMatch: boolean
}

export const INITIAL_REGISTER_FORM_DATA: RegisterFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    agreeTerms: false,
}
