import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";

@Component({
  selector: 'app-welcome-menu',
  templateUrl: './welcome-menu.page.html',
  styleUrls: ['./welcome-menu.page.scss'],
})
export class WelcomeMenuPage implements OnInit {
  user: any = null

  constructor(
    private router:Router,
    private contentService:ContentService
  ) {
    this.router.events.subscribe(async (event:any)=>{
      if (event instanceof NavigationEnd && event.url === '/welcome-menu') {
        this.user = await this.contentService.storage.get('user')
      }
    })
  }

  ngOnInit() {
  }

  goTo(url:string){
    this.router.navigate([url]);
  }
}
