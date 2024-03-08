import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-video-view',
  templateUrl: './video-view.page.html',
  styleUrls: ['./video-view.page.scss'],
})
export class VideoViewPage implements OnInit {
  videoUrl:any = null

  constructor(
    public router: Router,
  ) {
    this.router.events.subscribe((event)=>{
      if(event instanceof NavigationEnd && this.router.url.includes('/video-view')){
        this.videoUrl = environment.rootEndpoint + '/uploads/' + this.router.url.split('/').pop()
        console.log("Loading a video")
      }
    })
  }

  ngOnInit() {
  }

}
