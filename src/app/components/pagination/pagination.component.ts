import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent  implements OnInit {
  @Input() pageSegments: Array<any> = []
  @Output() onNavigate = new EventEmitter<any>

  constructor() { }

  ngOnInit() {}

  navigateTo(pageId:number){
    this.onNavigate.emit(pageId)
  }

}
