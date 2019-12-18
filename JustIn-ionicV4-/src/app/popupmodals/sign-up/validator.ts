//purpose of this class is to vaalidate the match between the 'password' and 'confirmpassword' controls

import { ValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
    if (formGroup.get('password').value === formGroup.get('confirmpassword').value)
      return null;
    else
      return {passwordMismatch: true};
  };