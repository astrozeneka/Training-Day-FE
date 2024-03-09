import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";

@Component({
  selector: 'app-video-view',
  templateUrl: './video-view.page.html',
  styleUrls: ['./video-view.page.scss'],
})
export class VideoViewPage implements OnInit {
  videoUrl:any = null
  videoId:any = null
  video:any = null

  constructor(
    public router: Router,
    public contentService: ContentService,
    public feedbackService: FeedbackService,
    public route: ActivatedRoute
  ) {
    this.videoId = this.route.snapshot.paramMap.get('id')
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url.includes('/video-view')){
        await this.contentService.storage.get('token')
        this.contentService.getOne(`/video-details/${this.videoId}`, {}).subscribe((res:any)=>{
          this.video = res
          this.videoUrl = environment.rootEndpoint + '/' + this.video.file.permalink
        })
        /*
        this.videoUrl = environment.rootEndpoint + '/uploads/' + this.router.url.split('/').pop()
        console.log("Loading a video")
        */
      }
    })
  }

  ngOnInit() {
  }

}
