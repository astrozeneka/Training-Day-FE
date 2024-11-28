import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { register } from 'swiper/element/bundle';
import SwiperCore, { Swiper } from 'swiper';

@Component({
  selector: 'app-store',
  templateUrl: './swipeable-store.page.html',
  styleUrls: ['./swipeable-store.page.scss'],
})
export class SwipeableStorePage implements OnInit, AfterViewInit {
  selectedTab: 'tab1'|'tab2'|'tab3' = 'tab1';
  @ViewChild('swiperEl') swiperEl: ElementRef|null = null as any

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // Initializing swiperParams
    const swiperParams = {
      on: {
        slideChange: this.onSlideChange,
        reachEnd: this.onReachEnd,
      }
    }
    Object.assign(this.swiperEl?.nativeElement, swiperParams)
  }

  swipeToIndex(index){
    let swiper = this.swiperEl?.nativeElement.swiper
    console.log(swiper)
    swiper?.slideTo(index)
  }

  onSwiper(param) {
    console.log(param);
  }

  onSlideChange = (param:Swiper|any)=>{
    // Slide change event
    let index = param.activeIndex
    this.selectedTab = `tab${index+1}` as any
    this.cdr.detectChanges()
  }

  onReachEnd(param) {
    // Unused
  }

}
