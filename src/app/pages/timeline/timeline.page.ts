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
  videos = []

  constructor(
    private router:Router,
    private contentService: ContentService
  ) {
    this.router.events.subscribe((event)=>{
      if(event instanceof NavigationEnd && this.router.url == '/timeline'){
        this.contentService.getCollection('/videos').subscribe((res:any)=>{
          console.log(res.data)
          this.videos = res.data
        })
      }
    })
  }

  ngOnInit() {
  }

  goToVideo(permalink:any){
    let url = environment.rootEndpoint + '/' + permalink
    window.open(url, '_blank')
  }

}
