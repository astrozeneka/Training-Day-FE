import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { CoachChatMasterService, coachTabOption } from 'src/app/coach-chat-master.service';
import { User } from 'src/app/models/Interfaces';
import Swiper from 'swiper';

@Component({
  selector: 'app-chat-master-v4',
  templateUrl: './chat-master-v4.page.html',
  styleUrls: ['./chat-master-v4.page.scss'],
})
export class ChatMasterV4Page implements OnInit, AfterViewInit {

  // Tabs
  selectedTab: coachTabOption;
  @ViewChild('swiperEl') swiperEl: ElementRef|null = null as any
  activeTab$:Observable<coachTabOption>|null

  constructor(
    private ccms: CoachChatMasterService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // The active tab should be loaded from the service
    this.activeTab$ = this.ccms.onActiveTab().pipe(map((tab)=>{
      //tab = 'nutritionist'
      this.selectedTab = tab ?? 'coach'
      return this.selectedTab
    }))
  }

  async ngAfterViewInit() {
    // Handle initial value which is loaded from cache
    let initialTab = await firstValueFrom(this.activeTab$) // From cache
    const swiperParams = {
      initialSlide: ['coach', 'nutritionist'].indexOf(initialTab),
      on: {
        slideChange: this.onSlideChange,
        reachEnd: this.onReachEnd // Unused
      }
    }
    Object.assign(this.swiperEl?.nativeElement, swiperParams)
    this.swiperEl.nativeElement.initialize()
  }

  onSlideChange = (param:Swiper|any)=>{
    let index = param.activeIndex
    this.selectedTab = ['coach', 'nutritionist'][index] as coachTabOption
    this.cdr.detectChanges()
    // Update cache
    this.ccms.activeTabData.set(this.selectedTab)
  }

  tabChanged(tab:coachTabOption){
    let swiper = this.swiperEl?.nativeElement.swiper
    let index = ['coach', 'nutritionist'].indexOf(tab)
    swiper?.slideTo(index)
  }

  onReachEnd(event){} // UNUSED

}
