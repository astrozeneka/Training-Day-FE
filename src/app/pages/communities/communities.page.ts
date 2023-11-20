import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute} from "@angular/router";
import {FeedbackService} from "../../feedback.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-communities',
  templateUrl: './communities.page.html',
  styleUrls: ['./communities.page.scss'],
})
export class CommunitiesPage implements OnInit {
  entityList:Array<any>|null = []
  pageCount:number = 0
  pageSegments:Array<any> = []
  pageOffset = 0;


  constructor(
    private contentService: ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService,
    private sanitizer: DomSanitizer
  ) {
    this.route.params.subscribe(()=>{
      this.loadData()
    })
  }

  ngOnInit() {
    this.loadData()
  }

  updatePage(page:number){
    this.pageOffset = page*10
    this.loadData()
  }

  loadData() {
    this.entityList = null
    // ไม่ม่ี search form value
    this.contentService.get('/communities', this.pageOffset, "", "")
      .subscribe(([data, metaInfo]) => {
        this.entityList = data as unknown as Array<any>
        // ไม่ต้องใส่ pagination ก่อน
        // จะใส่ที่หลังถ้าเราจะต้องการ
        console.log(this.entityList)
      })

  }

}
