import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrls: ['./videos.page.scss'],
})
export class VideosPage {
  title = '';
  category = ''
  videos:any = []

  constructor(
    private router: Router,
    private contentService: ContentService
  ) {
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd && event.url.includes('/videos/training')){
        this.title = "Découvrez les vidéo sur les entrainements"
        this.category = 'training'
        this.loadVideoList()
      }
      if(event instanceof NavigationEnd && event.url.includes('/videos/boxing')){
        this.title = "Découvrez les vidéo sur les boxes"
        this.category = 'boxing'
        this.loadVideoList()
      }
    })
  }

  loadVideoList() {
    console.log("Loading videos")
    this.contentService.getCollection(`/videos`, undefined, {'f_category': this.category}).subscribe((res: any) => {
      this.videos = res.data as object
    })
  }

  goToVideo(video_id:number){
    this.router.navigate(['/video-view/', video_id])
  }

  getUrl(suffix:string){
    return environment.rootEndpoint + '/' + suffix
  }


}
