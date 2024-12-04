import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { CoachChatMasterService, coachTabOption } from 'src/app/coach-chat-master.service';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { environment } from 'src/environments/environment';
import Swiper from 'swiper';

@Component({
  selector: 'app-chat-master-v4',
  templateUrl: './chat-master-v4.page.html',
  styleUrls: ['./chat-master-v4.page.scss'],
})
export class ChatMasterV4Page implements OnInit, AfterViewInit {

  // Currently logged user
  user:User = null

  // Tabs
  selectedTab: coachTabOption;
  @ViewChild('swiperEl') swiperEl: ElementRef|null = null as any
  activeTab$:Observable<coachTabOption>|null

  swiperIsReady: boolean = false // Is is to check if the swiper is ready

  constructor(
    private ccms: CoachChatMasterService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cs: ContentService
  ) { }

  ngOnInit() {
    // The active tab should be loaded from the service
    this.activeTab$ = this.ccms.onActiveTab().pipe(map((tab)=>{
      //tab = 'nutritionist'
      this.selectedTab = tab ?? 'coach'
      return this.selectedTab
    }))

    // The currently logged user (the old way for loading user)
    this.cs.userStorageObservable.gso$()
      .subscribe((user: User) => {
        this.user = user
        this.cdr.detectChanges()
      })
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
    this.swiperIsReady = true
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

  environment = environment
}
