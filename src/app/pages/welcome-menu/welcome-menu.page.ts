import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {Browser} from "@capacitor/browser";
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';
import { FeedbackService } from 'src/app/feedback.service';
import { DarkModeService } from 'src/app/dark-mode.service';

@Component({
  selector: 'app-welcome-menu',
  templateUrl: './welcome-menu.page.html',
  styleUrls: ['./welcome-menu.page.scss'],
})
export class WelcomeMenuPage implements OnInit {
  user: any = null

  constructor(
    private router:Router,
    public contentService:ContentService,
    private themeDetection: ThemeDetection,
    private feedbackService: FeedbackService,
    private dms: DarkModeService
  ) {
    this.router.events.subscribe(async (event:any)=>{
      if (event instanceof NavigationEnd && event.url === '/welcome-menu') {
        this.user = await this.contentService.storage.get('user')
      }
    })
  }

  useDarkMode: boolean = true; // On web, Ionic use dark by default

  async ngOnInit() {
    try {
      this.useDarkMode = await this.dms.isAvailableAndEnabled();
    } catch (e) {
      console.log("Getting device theme not available on web");
    }
  }

  async goTo(url:string){
    if("https://" === url.substr(0,8) || "http://" === url.substr(0,7)){
      await Browser.open({url: url})
    }else{
      this.router.navigate([url]);
    }
  }
}
