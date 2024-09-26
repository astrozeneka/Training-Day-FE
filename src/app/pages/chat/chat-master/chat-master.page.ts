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
  coachList:Array<any> = null
  nutritionistList:Array<any> = null
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

  prepareDiscussionData({data, metainfo}, searchTerm=""){ // Metainfo include a user_id key to unvalidate the data
    if(typeof data == "object") // Here data is an object, but should be array (This is from the way localStorage stores items)
      data = Object.values(data)
    for(let i = 0; i < data.length; i++){
      let url = data[i].thumbnail64 || data[i].profile_image?.permalink
      data[i].avatar_url = url ? this.contentService.addPrefix(url) : undefined
    }
    this.entityList = data as unknown as Array<any>
    if(searchTerm != ""){
      this.entityList = this.entityList.filter((item:any)=>{
        return item.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }
    this.coachList = this.entityList.filter((item:any)=>item.function == "coach")
    this.nutritionistList = this.entityList.filter((item:any)=>item.role_id == "nutritionist")
  }

  async initPusherListener(){
    this.broadcastingService.pusher.unsubscribe(`messages.${this.user.id}`)
    this.broadcastingService.pusher.subscribe(`messages.${this.user.id}`)
      .bind('master-updated',
        ({data, metainfo}) => {
          this.discussionStorageObservable.updateStorage({data, metainfo})
        }
      )

    await new Promise((resolve)=>setTimeout(resolve, 500))

    console.log("chat-master: Requesting the server to get the latest data")
    this.contentService.post('/chat/request-update/'+this.user.id, {})
      .subscribe(data => null)
  }

  async ngOnInit() {
    await (()=>new Promise(_=>{
      this.contentService.userStorageObservable.getStorageObservable().subscribe(async (user)=>{
        this.user = user;

        this.discussionStorageObservable.updateStorage({data:[], metainfo:{}})

        await this.initPusherListener()

        // Check whether the user is online or not
        let userSettings = this.user.user_settings || {}
        if(userSettings.activeFrom && userSettings.activeTo && userSettings.pauseDays){
            let activeFrom = userSettings.activeFrom // e.g. 08:00
            let activeTo = userSettings.activeTo // e.g. 18:00
            let pauseDays = userSettings.pauseDays // e.g. [0, 6] for Sunday and Saturday
            let now = new Date()

            // Check if the user is active
            let isPauseDay = pauseDays.includes(now.getDay())
            let [activeFromHour, activeFromMinute] = activeFrom.split(':').map(Number);
            let [activeToHour, activeToMinute] = activeTo.split(':').map(Number);
            let isInActiveTime = (now.getHours() > activeFromHour || (now.getHours() === activeFromHour && now.getMinutes() >= activeFromMinute)) &&
                                 (now.getHours() < activeToHour || (now.getHours() === activeToHour && now.getMinutes() < activeToMinute));
            
            this.isOnline = !isPauseDay && isInActiveTime
        }

        _(null)
      })
    }))();

    // IMPORTANT, this should be done outside the subscription block, otherwise it will be called twice
    this.discussionStorageObservable.getStorageObservable().subscribe(
      ({data, metainfo}) => {
        this.prepareDiscussionData({
          data,
          metainfo: {...metainfo, user_id: this.user.id}
        })
      }
    )

    this.initPusherListener()

    // 4. Manage the searchbar
    this.searchControl.valueChanges.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe((searchTerm)=>{
      this.prepareDiscussionData(
        this.discussionStorageObservable.getStorageValue(),
        searchTerm
      )
    })
  }

  navigateTo(url:string) {
    this.router.navigate([url])
  }

  // 5. The activity status
  isOnline:boolean = undefined
}
