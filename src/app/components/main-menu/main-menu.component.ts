import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
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
    (async()=>{
      this.user = await this.contentService.storage.get('user')
      console.log(this.user)
    })();
  }

  ngOnInit() {}

  menuNavigate(url:string){
    console.log(url)
    this.menuController.close();
    this.router.navigate([url])
  }
}
