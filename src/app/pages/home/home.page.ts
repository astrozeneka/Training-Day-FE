import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ContentService} from "../../content.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

// import { register } from 'swiper/element/bundle';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FeedbackService} from "../../feedback.service";
import {environment} from "../../../environments/environment";
import { Navigation, Pagination } from 'swiper/modules';
import { register } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage extends FormComponent implements OnInit, AfterViewInit {
  user:any = null
  content:any = null

  videos:any = []

  // Used for debugging only
  token:string = undefined

  override form = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email])
  })

  // The swiper at the top of the page
  @ViewChild('swiperEl') swiperEl: ElementRef|null = null as any

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private feedbackService: FeedbackService
  ) {
    super()
    this.route.params.subscribe(async (params)=>{
      //await this.loadData()
    })
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url == '/home'){
        this.contentService.getCollection('/videos', 0, {f_category:'home'}).subscribe((res:any)=>{
          this.videos = res.data as object
        })
      }
    })
    // register()
  }

  async ngOnInit() {
    let hiddeableIds = ['calory', 'reequilibrage']
    let hiddeableElts = hiddeableIds.map((id)=>document.getElementById(id))
    hiddeableElts.forEach((elt)=>{
      if(elt){
        elt.style.display = 'none'
      }
    })

    // The user data
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user)=>{
      this.user = user
    })

    // Debugging (to be removed later)
    this.contentService.storage.get('token').then((token)=>{
      this.token = token
    })
  }

  async ngAfterViewInit() {
    register()
    const swiperParams:SwiperOptions = {
      modules: [Navigation, Pagination],
      injectStylesUrls: [
        './node_modules/swiper/modules/navigation-element.min.css',
        './node_modules/swiper/modules/pagination-element.min.css'
      ]
    }
    Object.assign(this.swiperEl?.nativeElement, swiperParams)
    //this.swiperEl.nativeElement.initialize()
    console.log(this.swiperEl.nativeElement)
  }

  onSwiper(event: any){

  }

  onSlideChange(){
  }

  navigateTo(url:string){
    this.router.navigate([url])
  }

  registerToWaitingList(){
    this.contentService.post('/waiting-list', this.form.value)
      .subscribe((data)=>{
        this.feedbackService.registerNow('Votre email à bien été enregistré.', 'success')
      })
  }

  goToVideo(video_id:number){
    this.router.navigate(['/video-view/', video_id])
  }

  getUrl(suffix:string){
    return environment.rootEndpoint + '/' + suffix
  }

  toggleContent(element: HTMLElement, event: any): void {
    if (element.style.display === 'none') {
      element.style.display = 'block';
      event.target.innerText = 'Cacher';
    } else {
      element.style.display = 'none';
      event.target.innerText = 'Voir plus';
    }
  }

  getRemainingTrialDays(trialExpiresAt: string): number {
    const trialEndDate = new Date(trialExpiresAt);
    const currentDate = new Date();
    const timeDifference = trialEndDate.getTime() - currentDate.getTime();
    const days = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(days);
  }

  /**
   * Used for debugging
   */
  async unvalidateToken(){
    let token = await this.contentService.storage.get('token')
    let bearerHeaders = await this.contentService.bearerHeaders()
    console.log(`Token now: ${token}`, bearerHeaders)
    await this.contentService.storage.set('token', 'invalid_token');

    token = await this.contentService.storage.get('token')
    console.log(`Token is now: ${token}`, bearerHeaders)
  }

  async refreshToken(){
    let token = await this.contentService.storage.get('token')
    console.log(`Token is: ${token}`)

    this.contentService.refreshToken().subscribe((res:any)=>{
      // Sleep 1s
      setTimeout(async ()=>{
        let newToken = await this.contentService.storage.get('token')
        console.log(`Token has changed: ${token} -> ${newToken}`)
        this.token = newToken
        this.cdRef.detectChanges()
      }, 1000)
    })
  }
}
