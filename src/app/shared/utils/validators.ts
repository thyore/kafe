import { AbstractControl, ValidationErrors } from "@angular/forms";

export function nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Check if name contains any numeric characters
    const hasNumbers = /\d/.test(value);
    if (hasNumbers) {
        return { hasNumbers: true };
    }

    return null;
}

export function emailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Check if email contains numeric characters
    const hasNumbers = /\d/.test(value);
    if (hasNumbers) {
        return { hasNumbers: true };
    }

    // Check if email has a dot followed by text (valid domain format)
    const validDomain = /\.[a-zA-Z]+$/.test(value);
    if (!validDomain) {
        return { invalidDomain: true };
    }

    return null;
}

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const digitsOnly = value.replace(/\D/g, '');

    // Check if exactly 10 digits
    if (digitsOnly.length !== 10) {
        return { invalidLength: true };
    }

    return null;
}