import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'errorMessage'
})
export class ErrorMessagePipe implements PipeTransform {

  transform(errors: any, errorText: string, ...args: unknown[]): unknown {// If no errors, return an empty string
    // If a string is given
    if (errorText)
      return errorText
    
    if (!errors)
      return '';

    // Check for each error type and return the corresponding French message
    if ('required' in errors) {
      return 'Ce champ est requis.';
    } else if ('email' in errors) {
      return 'Veuillez entrer une adresse email valide.';
    } else if ('phone' in errors) {
      return 'Veuillez entrer un numéro de téléphone valide.';
    } else if ('min' in errors && errors.min && typeof errors.min.min === 'number') {
      const minValue = errors.min.min;
      return `La valeur doit être supérieure ou égale à ${minValue}.`;
    } else if ('max' in errors && errors.max && typeof errors.max.max === 'number') {
      const maxValue = errors.max.max;
      return `La valeur doit être inférieure ou égale à ${maxValue}.`;
    } else {
      // Fallback for unknown errors
      return 'Erreur inconnue.';
    }
  }

}
