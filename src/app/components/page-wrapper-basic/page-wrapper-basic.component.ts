import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-page-wrapper-basic',
  templateUrl: './page-wrapper-basic.component.html',
  styleUrls: ['./page-wrapper-basic.component.scss']
})
export class PageWrapperBasicComponent  implements OnInit {

  @Input() title: string = "";
  @Input() defaultBackHref: string = "";

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe((data:any) => {
      console.log()
    });
  }

}
