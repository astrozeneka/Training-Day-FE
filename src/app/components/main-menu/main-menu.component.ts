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

  constructor(
    private router: Router,
    private menuController: MenuController,
    contentService: ContentService
  ) {
    super(contentService);
    let observer = async(event:any)=>{
      if (event instanceof NavigationEnd) {
        console.log("Navigation end (menu caller)")
        this.user = await this.contentService.storage.get('user')
      }
    };
    console.log((this.router.events as any).currentObservers)
    if(!(this.router.events as any).observers.includes(observer)){
      this.router.events.subscribe(observer)
    }
  }

  ngOnInit() {}

  menuNavigate(url:string){
    console.log(url)
    this.menuController.close();
    this.router.navigate([url])
  }
}
