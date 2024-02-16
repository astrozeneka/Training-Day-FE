import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MenuController} from "@ionic/angular";
import {Storage} from "@ionic/storage-angular";
import {ContentService} from "../../content.service";
import {AbstractComponent} from "../abstract-component";

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
    let observer = async(event:any)=>{
      if (event instanceof NavigationEnd) {
        this.user = await this.contentService.storage.get('user')
        this.unreadMessages = await this.contentService.storage.get('unreadMessages')
      }
    };
    if(!(this.router.events as any).observers.includes(observer)){
      this.router.events.subscribe(observer)
    }
  }

  ngOnInit() {}

  menuNavigate(url:string){
    this.menuController.close();
    this.router.navigate([url])
  }
}
