import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {Browser} from "@capacitor/browser";

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

  async goTo(url:string){
    if("https://" === url.substr(0,8) || "http://" === url.substr(0,7)){
      await Browser.open({url: url})
    }else{
      this.router.navigate([url]);
    }
  }
}
