import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {finalize} from "rxjs";
import { AlertController } from '@ionic/angular';
import videojs from 'video.js';
import 'videojs-hls-quality-selector';
import '@videojs/http-streaming';  // Import VHS plugin

@Component({
  selector: 'app-video-view',
  templateUrl: './video-view.page.html',
  styleUrls: [
    './video-view.page.scss',
    "../../../../node_modules/video.js/dist/video-js.css"
  ],
    encapsulation: ViewEncapsulation.None // Add this line to change style scope
})
export class VideoViewPage implements OnInit, AfterViewInit {
  videoUrl:any = null
  videoId:any = null
  video:any = null
  user:any = null

  form = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'description': new FormControl('', [Validators.required]),
    'tags': new FormControl('', []),
    'category': new FormControl('undefined', []),
    'privilege': new FormControl(['public', 'hoylt', 'moreno', 'alonzo'], []),
    'hidden': new FormControl(false, []),
    'sort_field': new FormControl('', [])
  })
  displayedError = {
    'title': undefined,
    'description': undefined,
    'tags': undefined,
    'category': undefined,
    'privilege': undefined,
    'sort_field': undefined,
    // 'hidden': undefined
  }
  formValid = false
  isFormLoading = false

  // The video element reference
  @ViewChild('videoElement', { static: false }) videoElement:any = undefined
  videoPlayer: any; // A video-js object

  constructor(
    public router: Router,
    public contentService: ContentService,
    public feedbackService: FeedbackService,
    public route: ActivatedRoute,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    this.videoId = this.route.snapshot.paramMap.get('id')
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url.includes('/video-view')){
        this.user = await this.contentService.storage.get('user')
        await this.contentService.storage.get('token')
        this.contentService.getOne(`/video-details/${this.videoId}`, {}).subscribe((res:any)=>{
          this.video = res

          
          if (this.video.file){
            // The old way (Back-end server) of loading videos
            this.videoUrl = environment.rootEndpoint + '/' + this.video.file.permalink
          } else if (this.video.hlsUrl) {
            // The new way (AWS S3) of loading videos
            console.log("HLS Url detected")
            this.videoUrl = this.video.hlsUrl
          }
          this.cdr.detectChanges()
          // Manage the tags by removing the category (training or boxing) from the tags

          let tags = this.video.tags.split(',')
          let category = tags.filter((tag:any)=>tag.includes('training') || tag.includes('boxing'))
          tags = tags.filter((tag:any)=>!tag.includes('training') && !tag.includes('boxing'))
          this.video.tags = tags.join(', ')
          this.video.category = category.pop() // Always the last item of the pile, because the first item is the mother category

          // Patch the value (In next steps, fully typed expression should be used)
          this.video.privilege = this.video.privilege.join(',')
          this.form.patchValue(this.video)

          // Manage the reader
          this.initVideoJsReader()

          // THe older way to patch value (should be removed later)
          /*
          this.form.patchValue({
            title: this.video.title,
            description: this.video.description,
            tags: this.video.tags,
            category: this.video.category,
            privilege: this.video.privilege.join(','),
            hidden: this.video.hidden
          })*/
        })
      }
    })
    this.form.valueChanges.subscribe((value)=>{
      this.formValid = this.form.valid
    })
  }

  ngOnInit() {
  }

  ngAfterViewInit(){
    // this.setVideoJsReader()
    console.log("videoElement", this.videoElement)
  }

  initVideoJsReader(){
    // Manage the VideoJS reader
    let videoElement = this.videoElement.nativeElement as HTMLVideoElement
    this.videoPlayer = videojs(videoElement, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      sources: (
        [
          {
            src: this.videoUrl,
            type: 'application/x-mpegURL'
          }
        ] as any
      )
    })
    // Manage video styles
    this.videoPlayer.hlsQualitySelector();
    // Handling error
    this.videoPlayer.on('error', ()=>{
      console.log('video-js error occured:', this.videoPlayer.error())
    })
  }

  submit(event:any){
    event.preventDefault()
    this.isFormLoading = true
    let data:any = this.form.value
    data.id = this.videoId
    data.privilege = data.privilege.split(',')
    
    data.tags = [this.form.value.category, ...data.tags.split(',')]
      .filter(a=>a.trim() !== '')
      .join(',')

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

 async deleteVideo(){
    let alert = await this.alertController.create({
      header: "Supprimer la vidéo",
      message: "Veuillez confirmer la suppression",
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Supprimer',
          cssClass: 'ion-color-danger',
          handler: ()=>{
            this.contentService.delete(`/video`, `${this.videoId}`)
            .subscribe((response:any)=>{
              if(response.message){
                this.feedbackService.register('Le vidéo a été supprimé avec succes', 'success')
                window.history.back()
              }else{
                this.feedbackService.registerNow('Erreur lors de la suppression de la vidéo', 'danger')
              }
            })
          }
        }
      ]
    })
    await alert.present();
  }

}
