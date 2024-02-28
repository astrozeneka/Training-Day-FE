import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
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
    this.router.events.subscribe((event:any)=>{
      if(event instanceof NavigationEnd){
        this.entityList = null
        this.loadData()
      }
    })
  }

  ngOnInit() {
    this.loadData()
  }

  loadData(){
    this.contentService.get('/chat', 0, this.searchControl.value, "f_name")
      .subscribe(([data, metaInfo])=>{
        this.entityList = data as unknown as Array<any>
      })
  }

  navigateTo(url:string) {
    this.router.navigate([url])
  }
}
