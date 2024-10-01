import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayList'
})
export class DisplayListPipe implements PipeTransform {

  transform(value: string): string {
    return JSON.parse(value).join(', ')
  }

}
