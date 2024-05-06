import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {Router} from "@angular/router";

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent  implements OnInit {
  displayed = false;

  constructor(
    private location: Location,
    private router: Router
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
    this.location.back()
  }
}
