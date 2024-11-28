import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-swipeable-store-tabs',
  templateUrl: './swipeable-store-tabs.component.html',
  styleUrls: ['./swipeable-store-tabs.component.scss'],
})
export class SwipeableStoreTabsComponent  implements OnInit, OnChanges {

  @Input() selectedTab:string = 'tab1';
  @Output() swipeToIndex = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {}

  ngOnChanges(){
    console.log("onChanges from the tab" + this.selectedTab)
  }

}
