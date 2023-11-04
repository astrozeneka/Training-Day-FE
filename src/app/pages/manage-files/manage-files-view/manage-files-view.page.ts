import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {ActivatedRoute} from "@angular/router";
import {FormControl} from "@angular/forms";
import {refresh} from "ionicons/icons";

@Component({
  selector: 'app-manage-files-view',
  templateUrl: './manage-files-view.page.html',
  styleUrls: ['./manage-files-view.page.scss'],
})
export class ManageFilesViewPage implements OnInit {

  entityList:Array<any> = []
  pageCount:number = 0
  pageSegments:Array<any> = []
  pageOffset = 0;

  searchControl:FormControl = new FormControl("")

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
    this.contentService.get(`/files`, this.pageOffset, this.searchControl.value, "f_name").subscribe(([data, metaInfo])=>{
      this.entityList = data as unknown as Array<any>
      // The page segments
      this.pageCount = Math.ceil((metaInfo as any).count / 10) as number
      this.pageSegments = Array.from({length: this.pageCount} as any, (_, index)=> ({
        label: (index+1).toString(),
        value: index
      }))
    })
  }

  updatePage(page:number){
    this.pageOffset = page*10
    this.loadData()
  }
}
