import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {

  transform(value: string | number | undefined): string {
    if (!value) return '';

    // Convertir en chaîne de caractères et enlever les espaces existants s'il y en a
    const phoneStr = value.toString().replace(/\s+/g, '');

    // Utilise une expression régulière pour couper la chaîne tous les 2 caractères
    return phoneStr.replace(/(.{2})/g, '$1 ').trim();
  }

}
