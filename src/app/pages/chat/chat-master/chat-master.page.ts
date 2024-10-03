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
import { environment } from 'src/environments/environment';

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
  grouped_perishables = {}

  // Experimental features for the optimized messageLoading
  discussionStorageObservable = new StorageObservable<any>('discussionData')

  constructor(
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feeedbackService:FeedbackService,
    private router:Router,
    private broadcastingService: BroadcastingService,
  ) {
  }

  prepareDiscussionData({data, metainfo}, searchTerm=""){ // Metainfo include a user_id key to unvalidate the data
    console.log("Receive data to display, ", data, metainfo)
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
    console.log("Load entity list, ", this.entityList)
    this.coachList = this.entityList.filter((item:any)=>item.function == "coach")
    this.nutritionistList = this.entityList.filter((item:any)=>item.function == "nutritionist")
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
    
    // The old way to load the data
    this.contentService.post('/chat/request-update/'+this.user.id, {})
      .subscribe(data => null)
  }

  async ngOnInit() {
    await (()=>new Promise(_=>{
      this.contentService.userStorageObservable.getStorageObservable().subscribe(async (user)=>{
        this.user = user;
        this.grouped_perishables = this.user.grouped_perishables.reduce((acc:any, item:any)=>{
          acc[item.slug] = item
          return acc
        }, {})
        
        this.discussionStorageObservable.updateStorage({data:[], metainfo:{}})

        if (user.function === "customer" || user.function === "nutritionist") {
          await this.initPusherListener()
        }
        
        if (user.function === "coach") {
          this.displayMessageForFormInit()
          this.displayMessageForForm.setValue(this.user.function == "coach" ? "coach" : "nutritionist")
        }

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
    this.discussionStorageObservable.getStorageObservable().subscribe( // Not a good way for loading cached data
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

  // 6. Showing messages for coach or for nutritionnist (only if the coach is connected)
  messageDetailsPrefix = '/chat/details/'
  displayMessageForForm = new FormControl(undefined)
  displayMessageForFormInit(){
    this.displayMessageForForm.valueChanges.subscribe((value)=>{
      let userIdToLoad
      if (value == "coach")
        userIdToLoad = this.user.id
      else{
        userIdToLoad = environment.nutritionistId // WARNING, it shouldn't be hardcoded like this
        this.messageDetailsPrefix = '/chat/details/n_'
      }

      // Reinitialize the pusher to allow loading
      // The code below is redundant, should refactorized
      this.broadcastingService.pusher.unsubscribe(`messages.${userIdToLoad}`)
      this.broadcastingService.pusher.subscribe(`messages.${userIdToLoad}`)
        .bind('master-updated',
          ({data, metainfo}) => {
            this.discussionStorageObservable.updateStorage({data, metainfo})
          }
        )
      this.contentService.post('/chat/request-update/'+userIdToLoad, {})
        .subscribe(data => null)

    })
  }

  navigateToChatDetails(user_id){
    let pref = this.displayMessageForForm.value!='nutritionnist'?'/chat/details/':'/chat/details/n_'
    this.navigateTo(pref+user_id)
  }
}
