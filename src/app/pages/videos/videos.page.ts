import { Component, OnInit } from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {environment} from "../../../environments/environment";
import { first, last } from 'rxjs/operators';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrls: ['./videos.page.scss'],
})
export class VideosPage {
  title = '';
  category = ''
  videos:any = []
  videoLoading = false
  jwtToken = undefined

  constructor(
    private router: Router,
    protected contentService: ContentService
  ) {
    console.log("Subscribe video loading")
    let subscription = router.events.subscribe((event) => {
      if(event instanceof NavigationEnd && event.url.includes('/videos/training')){
        this.title = "Découvrez les vidéos sur les entrainements"
        this.category = 'training'
        this.loadVideoList()
      }
      if(event instanceof NavigationEnd && event.url.includes('/videos/boxing')){
        this.title = "Découvrez les vidéos sur les boxes"
        this.category = 'boxing'
        this.loadVideoList()
      }
      if(event instanceof NavigationStart){
        console.log("Unsubscribe video loading")
        subscription.unsubscribe()
      }
    })
  }

  async loadVideoList() {
    this.jwtToken = await this.contentService.storage.get('token') // Used by the child ion-infinite loader

    // Should fire event to update the video content
    /*
    if (this.videoLoading) return
    console.log("Loading videos")
    this.videoLoading = true
    this.contentService.getCollection(`/videos`, undefined, {'f_category': this.category}, 3).subscribe((res: any) => {
      this.videos = res.data as object
      setTimeout(() => {
        this.videoLoading = false
      }, 1000)
    })
     */
  }

  goToVideo(video_id:number){
    this.router.navigate(['/video-view/', video_id])
  }

  getUrl(suffix:string){
    return environment.rootEndpoint + '/' + suffix
  }


}
