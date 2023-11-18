import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";

@Component({
  selector: 'app-chat-master',
  templateUrl: './chat-master.page.html',
  styleUrls: ['./chat-master.page.scss'],
})
export class ChatMasterPage implements OnInit {
  entityList:Array<any>|null = []
  searchControl:FormControl = new FormControl("")

  constructor(
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feeedbackService:FeedbackService,
    private router:Router
  ) {
    this.route.params.subscribe(()=>{
      this.loadData()
    })
  }

  ngOnInit() {
    this.loadData()
  }

  loadData(){
    this.entityList = null
    this.contentService.get('/messages', 1000, this.searchControl.value, "f_name")
      .subscribe(([data, metaInfo])=>{
        this.entityList = data as unknown as Array<any>
        console.log(this.entityList)
      })
  }

  navigateTo(url:string) {
    this.router.navigate([url])
  }
}