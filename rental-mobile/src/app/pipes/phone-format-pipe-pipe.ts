import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true,
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | number | undefined | null): string {
    if (!value) return '';
    const phoneStr = value.toString().replace(/\s+/g, '');
    return phoneStr.replace(/(.{2})/g, '$1 ').trim();
  }
}
