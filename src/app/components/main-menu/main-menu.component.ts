import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MenuController} from "@ionic/angular";
import {Storage} from "@ionic/storage-angular";
import {ContentService} from "../../content.service";
import {AbstractComponent} from "../abstract-component";
import { ThemeDetection, ThemeDetectionResponse } from "@ionic-native/theme-detection/ngx";


@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent extends AbstractComponent implements OnInit {
  user: any = null
  unreadMessages: any = null

  constructor(
    private router: Router,
    private menuController: MenuController,
    contentService: ContentService
  ) {
    super(contentService);
    this.router.events.subscribe(async(event:any)=>{
      if (event instanceof NavigationEnd) {
        this.user = await this.contentService.storage.get('user')
        if(this.user) {
          this.contentService.getOne('/chat/unread', {})
            .subscribe((data: any) => {
              this.unreadMessages = data.unread
            })
        }
      }
    })
  }

  ngOnInit() {}

  menuNavigate(url:string){
    this.menuController.close();
    this.router.navigate([url])
  }
}
