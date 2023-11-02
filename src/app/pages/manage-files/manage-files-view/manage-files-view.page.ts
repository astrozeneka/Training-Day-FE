import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-manage-files-view',
  templateUrl: './manage-files-view.page.html',
  styleUrls: ['./manage-files-view.page.scss'],
})
export class ManageFilesViewPage implements OnInit {

  entityList:Array<any> = []

  constructor(
    private contentService:ContentService,
    private route:ActivatedRoute
  ) {
    this.route.params.subscribe(()=>{
      this.loadData()
    })
  }

  ngOnInit() {
    this.loadData()
  }

  loadData(){
    console.log("Refresh")
    this.contentService.get('/files').subscribe(([data, metaInfo])=>{
      this.entityList = data as unknown as Array<any>
      console.log(data)
      console.log(metaInfo)
    })
  }
}
