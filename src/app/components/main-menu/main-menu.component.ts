import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {MenuController} from "@ionic/angular";

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent  implements OnInit {

  constructor(
    private router: Router,
    private menuController: MenuController
  ) { }

  ngOnInit() {}

  menuNavigate(url:string){
    console.log(url)
    this.menuController.close();
    this.router.navigate([url])
  }
}
