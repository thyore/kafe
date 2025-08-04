import { FormGroup } from "@angular/forms";

export function formatPhoneNumber(event: any, selectedCountryCode: string, form: FormGroup): void {
    let value = event.target.value;
    
    // Remove all non-digit characters
    let digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (digitsOnly.length > 10) {
      digitsOnly = digitsOnly.substring(0, 10);
    }
    
    // Format the phone number
    let formattedValue = '';
    if (digitsOnly.length > 0) {
      if (digitsOnly.length <= 3) {
        formattedValue = digitsOnly;
      } else if (digitsOnly.length <= 6) {
        formattedValue = digitsOnly.substring(0, 3) + '-' + digitsOnly.substring(3);
      } else {
        formattedValue = digitsOnly.substring(0, 3) + '-' + digitsOnly.substring(3, 6) + '-' + digitsOnly.substring(6);
      }
    }
    
    // Update the form control
    form.get('phoneNumber')?.setValue(formattedValue, { emitEvent: false });
    event.target.value = formattedValue;
}
