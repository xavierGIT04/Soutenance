import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fcfa',
  standalone: true,
})
export class FcfaPipe implements PipeTransform {
  transform(value: string | number | undefined | null): string {
    if (value === null || value === undefined || value === '') return '0 F';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0 F';
    return new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' F';
  }
}
