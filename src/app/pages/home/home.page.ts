import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ContentService} from "../../content.service";
import {ActivatedRoute, Router} from "@angular/router";

import { register } from 'swiper/element/bundle';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FeedbackService} from "../../feedback.service";



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage extends FormComponent {
  user:any = null
  content:any = null

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
      await this.loadData()
    })
    register()
  }

  async ngOnInit() {
    this.loadData()
  }

  async loadData(){
    /*
    this.user = await this.contentService.storage.get('user')
    this.cdRef.detectChanges()

    // Load the content
    this.contentService.getOne('/posts/details', {'f_permalink': `${this.user.role}-home`})
      .subscribe((data)=>{
        this.content = data
      })
     */
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
}
