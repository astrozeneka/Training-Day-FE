import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {MenuController} from "@ionic/angular";
import {Storage} from "@ionic/storage-angular";
import {ContentService} from "../../content.service";

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent  implements OnInit {
  user: any = null

  constructor(
    private router: Router,
    private menuController: MenuController,
    private contentService: ContentService
  ) {
    // TODO: หาวิธีที่ทำให้ภาคนี้ optimized
    this.router.events.subscribe((res)=>{
      this.contentService.storage.get('user')
        .then((u)=>{
          this.user = u
        })
    })
  }

  ngOnInit() {}

  menuNavigate(url:string){
    console.log(url)
    this.menuController.close();
    this.router.navigate([url])
  }
}
