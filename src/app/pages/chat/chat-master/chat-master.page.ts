import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import { Badge } from '@capawesome/capacitor-badge';
import {BroadcastingService} from "../../../broadcasting.service";

@Component({
  selector: 'app-chat-master',
  templateUrl: './chat-master.page.html',
  styleUrls: ['./chat-master.page.scss'],
})
export class ChatMasterPage implements OnInit {
  entityList:Array<any>|null = []
  coachList:Array<any> = []
  nutritionistList:Array<any> = []
  searchControl:FormControl = new FormControl("")
  user:any = null

  constructor(
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feeedbackService:FeedbackService,
    private router:Router,
    private broadcastingService: BroadcastingService
  ) {
  }

  prepareDiscussionData({data, metainfo}){
    for(let i = 0; i < data.length; i++){
      let url = data[i].thumbnail64 || data[i].profile_image?.permalink
      data[i].avatar_url = url ? this.contentService.addPrefix(url) : undefined
    }
    this.entityList = data as unknown as Array<any>
    this.coachList = this.entityList.filter((item:any)=>item.role_id == 3)
    this.nutritionistList = this.entityList.filter((item:any)=>item.role_id == 4)
  }

  async ngOnInit() {
    let user:any = await this.contentService.storage.get('user')
    console.log(user)

    // 1. Load from the localstorage to make the app run faster
    console.log("discussionData: ", await this.contentService.storage.get('discussionData'))
    let discussionData:any = await this.contentService.storage.get('discussionData')
    if(discussionData)
      this.prepareDiscussionData(discussionData)

    // 2. Register listener to listen update from the server
    console.log('channel name: ', `messages.${user.id}`)
    this.broadcastingService.pusher.subscribe(`messages.${user.id}`)
      .bind('master-updated', ({data, metainfo})=>{
        this.prepareDiscussionData({data, metainfo})
        // Save to the local storage
        this.contentService.storage.set('discussionData', {data, metainfo})
      })
    await new Promise((resolve)=>setTimeout(resolve, 1000)) // Wait 1 second

    // 3. Request the server to get the latest data
    this.contentService.post('/chat/request-update/'+user.id, {})
      .subscribe((data)=>{
        // console.log('Request update: ', data)
      })
  }

  /**
   * @unused anymore
   */
  loadData(){
    /*
    this.contentService.get('/chat', 0, this.searchControl.value, "f_name", 1000)
      .subscribe(([data, metaInfo])=>{
        for(let i = 0; i < data.length; i++){
          let url = data[i].thumbnail64 || data[i].profile_image?.permalink
          data[i].avatar_url = url ? this.contentService.addPrefix(url) : undefined
        }
        this.entityList = data as unknown as Array<any>
        this.coachList = this.entityList.filter((item:any)=>item.role_id == 3)
        this.nutritionistList = this.entityList.filter((item:any)=>item.role_id == 4)
        console.log(data)
      })

     */
  }

  navigateTo(url:string) {
    this.router.navigate([url])
  }
}
