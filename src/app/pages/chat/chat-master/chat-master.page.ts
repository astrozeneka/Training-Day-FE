import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import { Badge } from '@capawesome/capacitor-badge';
import {BroadcastingService} from "../../../broadcasting.service";
import {debounceTime, distinctUntilChanged} from "rxjs";
import StorageObservable from "../../../utils/StorageObservable";

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

  // Experimental features for the optimized messageLoading
  discussionStorageObservable = new StorageObservable<any>('discussionData')

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

  prepareDiscussionData({data, metainfo}){ // Metainfo include a user_id key to unvalidate the data
    if(typeof data == "object") // Here data is an object, but should be array (This is from the way localStorage stores items)
      data = Object.values(data)
    for(let i = 0; i < data.length; i++){
      let url = data[i].thumbnail64 || data[i].profile_image?.permalink
      data[i].avatar_url = url ? this.contentService.addPrefix(url) : undefined
    }
    this.entityList = data as unknown as Array<any>
    this.coachList = this.entityList.filter((item:any)=>item.function == "coach")
    this.nutritionistList = this.entityList.filter((item:any)=>item.role_id == "nutritionist")
  }

  async ngOnInit() {
    this.user = await this.contentService.storage.get('user') // TODO, should use a more appropriate techniques

    this.discussionStorageObservable.updateStorage({data:[], metainfo:{}})
    /*let discussionData:any = await this.contentService.storage.get('discussionData')
    if(discussionData)
      this.prepareDiscussionData(discussionData)
     */
    this.discussionStorageObservable.getStorageObservable().subscribe(
      ({data, metainfo}) => {
        this.prepareDiscussionData({
          data,
          metainfo: {...metainfo, user_id: this.user.id}
        })
      }
    )
    // 2. Register listener to listen update from the server
    this.broadcastingService.pusher.subscribe(`messages.${this.user.id}`)
      .bind('master-updated',
        ({data, metainfo}) => this.discussionStorageObservable.updateStorage({data, metainfo})
      )
    await new Promise((resolve)=>setTimeout(resolve, 1000)) // Wait 1 second

    // 3. Request the server to get the latest data
    this.contentService.post('/chat/request-update/'+this.user.id, {})
      .subscribe(data => null)
  }

  navigateTo(url:string) {
    this.router.navigate([url])
  }
}
