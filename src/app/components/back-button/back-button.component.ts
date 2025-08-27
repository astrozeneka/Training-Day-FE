import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {Router} from "@angular/router";
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent  implements OnInit {
  displayed = false;
  @Input() customUrl: string = null

  constructor(
    private location: Location,
    private router: Router,
    private navCtrl: NavController
  ) {
    this.location.onUrlChange((value) => {
      this.update()
    })
    this.update()
  }

  update(){
    if((this.location.getState() as any).navigationId > 1){
      this.displayed = true
    }
  }

  ngOnInit() {}

  navigateBack(){
    if(this.customUrl)
      this.router.navigateByUrl(this.customUrl)
    else
      this.navCtrl.back()
  }
}
