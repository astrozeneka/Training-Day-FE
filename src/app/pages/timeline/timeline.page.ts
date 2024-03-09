import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit {
  videos:any = []

  constructor(
    private router:Router,
    private contentService: ContentService
  ) {
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url == '/timeline'){
        this.contentService.getCollection('/videos').subscribe((res:any)=>{
          console.log(res.data)
          this.videos = res.data as object
        })
      }
    })
  }

  ngOnInit() {
  }

  goToVideo(video_id:number){
    this.router.navigate(['/video-view/', video_id])
  }

  getUrl(suffix:string){
    return environment.rootEndpoint + '/' + suffix
  }

}
