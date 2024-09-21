import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ContentService} from "../../content.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

import { register } from 'swiper/element/bundle';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FeedbackService} from "../../feedback.service";
import {environment} from "../../../environments/environment";



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage extends FormComponent implements OnInit {
  user:any = null
  content:any = null

  videos:any = []

  override form = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email])
  })

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
        this.contentService.getCollection('/videos').subscribe((res:any)=>{
          this.videos = res.data as object
        })
      }
    })
    register()
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
}
