import { Component, OnInit } from '@angular/core';
import {DefaultPage} from "../default.page";
import {DomSanitizer} from "@angular/platform-browser";
import {FormControl} from "@angular/forms";
import {ContentService} from "../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {FeedbackService} from "../../feedback.service";
import {navigate} from "ionicons/icons";

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage extends DefaultPage implements OnInit {
  entityList:Array<any>|null = []
  pageCount:number = 0
  pageSegments:Array<any> = []
  pageOffset = 0;

  searchControl:FormControl = new FormControl("")

  constructor(
    sanitizer:DomSanitizer,
    router:Router,
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService
  ) {
    super(sanitizer, router)
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

  loadData(){
    this.entityList = null
    this.contentService.get('/posts', this.pageOffset, this.searchControl.value, "f_title", 10, {f_tags: "news"})
      .subscribe(([data, metaInfo])=>{
        this.entityList = data as unknown as Array<any>
        this.pageCount = Math.ceil((metaInfo as any).count / 10) as number
        this.pageSegments = Array.from({length: this.pageCount} as any, (_, index)=> ({
          label: (index+1).toString(),
          value: index
        }))
      })
  }
}
