import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {ContentService} from "./content.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  user: any = null;
  constructor(
    private router:Router,
    private contentService: ContentService
  ) {
    router.events.subscribe(()=>{
      this.contentService.storage.get('user')
        .then((u)=>{
          this.user = u;
          console.log(this.user)
        })
    })
  }
}
