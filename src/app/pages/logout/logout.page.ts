import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../content.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit {

  constructor(
    private contentService:ContentService,
    private router:Router
  ) { }

  ngOnInit() {
    this.contentService.storage.remove('token')
    this.contentService.storage.remove('user')
    this.router.navigate(['login'])
  }

}
