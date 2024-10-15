import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {finalize} from "rxjs";

@Component({
  selector: 'app-video-view',
  templateUrl: './video-view.page.html',
  styleUrls: ['./video-view.page.scss'],
})
export class VideoViewPage implements OnInit {
  videoUrl:any = null
  videoId:any = null
  video:any = null
  user:any = null

  form = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'description': new FormControl('', [Validators.required]),
    'tags': new FormControl('', []),
    'category': new FormControl('undefined', []),
    'privilege': new FormControl("['public', 'hoylt', 'moreno', 'alonzo']", []),
    'hidden': new FormControl(false, [])
  })
  displayedError = {
    'title': undefined,
    'description': undefined,
    'tags': undefined,
    'category': undefined,
    'privilege': undefined,
    // 'hidden': undefined
  }
  formValid = false
  isFormLoading = false

  constructor(
    public router: Router,
    public contentService: ContentService,
    public feedbackService: FeedbackService,
    public route: ActivatedRoute
  ) {
    this.videoId = this.route.snapshot.paramMap.get('id')
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url.includes('/video-view')){
        this.user = await this.contentService.storage.get('user')
        await this.contentService.storage.get('token')
        this.contentService.getOne(`/video-details/${this.videoId}`, {}).subscribe((res:any)=>{
          this.video = res
          this.videoUrl = environment.rootEndpoint + '/' + this.video.file.permalink
          // Manage the tags by removing the category (training or boxing) from the tags
          let category = ''
          if (this.video.tags.includes('training')){
            category = 'training'
            this.video.tags = this.video.tags.split(',').filter((tag:any)=>tag != 'training').join(',')
          }else if(this.video.tags.includes('boxing')){
            category = 'boxing'
            this.video.tags = this.video.tags.split(',').filter((tag:any)=>tag != 'boxing').join(',')
          }
          // Patch the form values
          console.log(this.video.privilege)
          this.form.patchValue({
            title: this.video.title,
            description: this.video.description,
            tags: this.video.tags,
            category: category,
            privilege: this.video.privilege,
            hidden: this.video.hidden
          })
        })
      }
    })
    this.form.valueChanges.subscribe((value)=>{
      this.formValid = this.form.valid
    })
  }

  ngOnInit() {
  }

  submit(event:any){
    event.preventDefault()
    this.isFormLoading = true
    let data:any = this.form.value
    data.id = this.videoId
    if (this.form.value.category == 'training'){
      data.tags = 'training,' + data.tags
    }else if (this.form.value.category == 'boxing'){
      data.tags = 'boxing,' + data.tags
    }else{
      data.tags = data.tags
    }
    data.video_id = this.video.id
    this.contentService.put('/video', data)
      .pipe(finalize(()=>this.isFormLoading = false)) // WARNING, no validation is present here
      .subscribe((response:any)=>{
        if(response.id){
          this.feedbackService.register('Le vidéo a été mis à jour avec succes', 'success')
          // Go back if possible
          window.history.back()
          

          // this.router.navigate(['/home'])
        }else{
          this.feedbackService.registerNow('Erreur lors de la mise à jour de la vidéo', 'danger')
        }
      })
  }

  deleteVideo(){
    this.contentService.delete(`/video`, `${this.videoId}`)
      .subscribe((response:any)=>{
        if(response.message){
          this.feedbackService.register('Le vidéo a été supprimé avec succes', 'success')
          this.router.navigate(['/home'])
        }else{
          this.feedbackService.registerNow('Erreur lors de la suppression de la vidéo', 'danger')
        }
      })
  }

}
