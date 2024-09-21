import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {Browser} from "@capacitor/browser";
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';

@Component({
  selector: 'app-welcome-menu',
  templateUrl: './welcome-menu.page.html',
  styleUrls: ['./welcome-menu.page.scss'],
})
export class WelcomeMenuPage implements OnInit {
  user: any = null

  constructor(
    private router:Router,
    private contentService:ContentService,
    private themeDetection: ThemeDetection
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
      this.useDarkMode = await this.isAvailable() && (await this.isDarkModeEnabled()).value;
    } catch (e) {
      console.log("Getting device theme not available on web");
    }
    console.log("Dark mode enabled: ", this.useDarkMode);
  }

  async goTo(url:string){
    if("https://" === url.substr(0,8) || "http://" === url.substr(0,7)){
      await Browser.open({url: url})
    }else{
      this.router.navigate([url]);
    }
  }

  private async isAvailable(): Promise<any> {
    try {
      let dark_mode_available: ThemeDetectionResponse = await this.themeDetection.isAvailable();
      return dark_mode_available;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private async isDarkModeEnabled(): Promise<ThemeDetectionResponse> {
    try {
      let dark_mode_enabled: ThemeDetectionResponse = await this.themeDetection.isDarkModeEnabled();
      return dark_mode_enabled;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
