import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayPrice'
})
export class DisplayPricePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
