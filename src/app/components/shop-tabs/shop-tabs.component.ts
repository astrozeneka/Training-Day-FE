import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-shop-tabs',
  templateUrl: './shop-tabs.component.html',
  styleUrls: ['./shop-tabs.component.scss'],
})
export class ShopTabsComponent  implements OnInit {

  @Input() selectedTab:string = '';
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  // @ts-ignore
  navigateToPage(url){
    this.router.navigateByUrl(url)
  }
}
