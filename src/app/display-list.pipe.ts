import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayList'
})
export class DisplayListPipe implements PipeTransform {

  transform(value: string, index:number = undefined): string {
    if(index === undefined)
      return JSON.parse(value).join(', ')
    else
      return JSON.parse(value)[index]
  }

}
