import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const names = value.trim().split(/\s+/);
    
    if (names.length === 0) {
      return '';
    }

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    // Get first letter of first name and first letter of last name
    const firstName = names[0];
    const lastName = names[names.length - 1];
    
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
}
