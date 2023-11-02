import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";

@Component({
  selector: 'app-manage-files-view',
  templateUrl: './manage-files-view.page.html',
  styleUrls: ['./manage-files-view.page.scss'],
})
export class ManageFilesViewPage implements OnInit {

  entityList:Array<any> = []

  constructor(
    private contentService:ContentService
  ) { }

  ngOnInit() {
    this.contentService.get('/files').subscribe(([data, metaInfo])=>{
      this.entityList = data as unknown as Array<any>
      console.log(data)
      console.log(metaInfo)
    })
  }

}
