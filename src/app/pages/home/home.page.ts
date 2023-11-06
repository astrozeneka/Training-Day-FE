import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ContentService} from "../../content.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  user:any = null

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.route.params.subscribe(async (params)=>{

      await this.loadData()
    })
  }

  async ngOnInit() {
    this.loadData()
  }

  async loadData(){
    this.user = await this.contentService.storage.get('user')
    this.cdRef.detectChanges()
  }


}
