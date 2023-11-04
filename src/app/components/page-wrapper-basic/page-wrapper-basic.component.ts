import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-page-wrapper-basic',
  templateUrl: './page-wrapper-basic.component.html',
  styleUrls: ['./page-wrapper-basic.component.scss']
})
export class PageWrapperBasicComponent  implements OnInit {

  @Input() title: string = "";
  @Input() defaultBackHref: string = "";

  protected urlForAdd = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.urlForAdd = router.url.replace('/view', '/add')
  }

  ngOnInit() {
    this.route.data.subscribe((data:any) => {
      console.log()
    });
  }

  navigateTo(url:string){
    this.router.navigateByUrl(url)
  }
}
