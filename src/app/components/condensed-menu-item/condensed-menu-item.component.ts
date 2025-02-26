import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-condensed-menu-item',
  templateUrl: './condensed-menu-item.component.html',
  styleUrls: ['./condensed-menu-item.component.scss'],
})
export class CondensedMenuItemComponent  implements OnInit {

  @Input() color:string = "primary"
  @Input() routerLink:string|undefined = undefined
  @Input() img:string = "/assets/icon/condensed-menu/icon-box.svg"

  constructor(
    private router: Router
  ) { }

  ngOnInit() {}

  click(event:any){
    if (this.routerLink){
      this.router.navigate([this.routerLink])
    }
  }

}
