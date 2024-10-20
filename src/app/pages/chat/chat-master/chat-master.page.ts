import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController, Platform} from "@ionic/angular";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import { Badge } from '@capawesome/capacitor-badge';
import {BroadcastingService} from "../../../broadcasting.service";
import {catchError, debounce, debounceTime, distinctUntilChanged, filter, merge, throwError} from "rxjs";
import StorageObservable from "../../../utils/StorageObservable";
import { environment } from 'src/environments/environment';
import { set } from 'date-fns';
import { ChatService } from 'src/app/chat.service';
import { NativeAudio } from '@capgo/native-audio';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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

  // Unread messages
  totalUnreadMessages = undefined

  // Variables for the pusher notification system
  registeredPusherCorrespondentIds = []
  instantMessagingInitialized = false

  // The audio notification
  audio_incoming: any = undefined

  // Hearbeat interval
  heartbeat_interval = undefined

  // Window focus registration
  environment = environment
  windowFocusRegistered = false

  constructor(
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService,
    private router:Router,
    private broadcastingService: BroadcastingService,
    private chatService: ChatService,
    private platform: Platform
  ) {
  }

  prepareDiscussionData({data, metainfo}, searchTerm=""){ // Metainfo include a user_id key to unvalidate the data
    console.log("======= PREPARE DISCUSSION DATA =======")
    if (data.length == 0) // Sometimes, it is fired without data, it is a bug
      return
    // To optimized this code should include a debounce time
    if(typeof data == "object") // Here data is an object, but should be array (This is from the way localStorage stores items)
      data = Object.values(data)
    for(let i = 0; i < data.length; i++){
      let url = data[i].thumbnail64 || data[i].profile_image?.permalink
      data[i].avatar_url = url ? this.contentService.addPrefix(url) : undefined
    }
    this.entityList = data as unknown as Array<any>
    this.entityList = this.entityList.filter((item:any)=>item.id != this.user.id) // cannot chat to himself
    
    // Sort entityList by entity.messages[0].created_at
    this.entityList = this.entityList.sort((a, b)=>{ // TODO, avoid reusage
      let dateA = a.messages.length > 0 ? Date.parse(a.messages[0].created_at) : 0
      let dateB = b.messages.length > 0 ? Date.parse(b.messages[0].created_at) : 0
      return dateB - dateA
    })

    if(searchTerm != ""){
      this.entityList = this.entityList.filter((item:any)=>{
        return item.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Reorder the messages by the last message (using id ???)
    this.totalUnreadMessages = 0
    for(let i = 0; i < this.entityList.length; i++){
      this.entityList[i].messages = this.entityList[i].messages.sort((a, b)=>a.id - b.id) // For later, this can be replaced by the timestamp/date
      this.totalUnreadMessages += this.entityList[i].unread
    }

    this.coachList = this.entityList.filter((item:any)=>item.function == "coach")
    this.nutritionistList = this.entityList.filter((item:any)=>item.function == "nutritionist")

    // Register pusher notification to allow instant UI update
    /*this.entityList.forEach(entity=>{
      console.log(entity.id)
      if(this.registeredPusherCorrespondentIds.includes(entity.id))
        return
      /*this.chatService.registerChatEvents(entity.id, (p)=>{
        console.log("Notification from pusher", p)
      })*

    })*/

    if (!this.instantMessagingInitialized){
      this.instantMessagingInitialized = true
      console.log("Initializing pusher : messages."+this.user.id)
      this.broadcastingService.pusher.subscribe(`messages.${this.user.id}`)
        .bind_global((event, {data, metainfo})=>{
          // Data is the message data from the backend
          if(data instanceof Array){ // Sometimes, there is a bug here
            data.forEach(message=>{
              // Add the message to be displayed on the item
              let entity = this.entityList.find(entity=>entity.id == message.sender_id || entity.id == message.recipient_id)
              if (!entity)
                return
              console.log("Notification from pusher (evt: "+event+")")
              console.log("Entity: ", entity)
              entity.messages = entity.messages.filter(m=>m.id != message.id)
              entity.messages.push(message)
              entity.messages = entity.messages.sort((a, b)=>b.id - a.id)

              if (message.sender && message.sender_id != this.user.id){
                entity.unread = message.sender.unread || 0
                this.totalUnreadMessages += 1
                this.chatService.unreadMessagesSubject.next(this.totalUnreadMessages)
                this.playIncomingMessageAudio()
              }
              if (message.sender_id == this.user.id)
                entity.unread = 0

            })
            // Resort the entityList
            this.entityList = this.entityList.sort((a, b)=>{ // TODO, avoid reusage
              let dateA = a.messages.length > 0 ? Date.parse(a.messages[0].created_at) : 0
              let dateB = b.messages.length > 0 ? Date.parse(b.messages[0].created_at) : 0
              return dateB - dateA
            })
            //console.log("Data: ", data)
            //console.log("Notification received from pusher_global", event, data)
          }
        })
    }

  }

  pusherListenerInitialized = false
  async initPusherListener(){
    if (this.pusherListenerInitialized)
      return
    this.pusherListenerInitialized = true
    // TODO later, with an optimized way
    //this.broadcastingService.pusher.unsubscribe(`messages.${this.user.id}`) // Not optimized
    this.broadcastingService.pusher.subscribe(`messages.${this.user.id}`)   // Not optimized
      .bind('master-updated',
        ({data, metainfo}) => {
          this.discussionStorageObservable.updateStorage({data, metainfo})
        }
      )

    await new Promise((resolve)=>setTimeout(resolve, 500)) // Not optimized
    
    // The old way to load the data (Generaly, this throw 429 too many requests error)
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

    // 5. Initialize the online status parameters
    this.initializeOnlineStatusParameters()

    // 6. The total unread message
    this.chatService.unreadMessages$.subscribe((unreadMessages) => {
      this.totalUnreadMessages = unreadMessages
    })

    // 7. The audios
    if (this.platform.is('capacitor')){ // mobile
      try{
        NativeAudio.preload({
          assetId: 'incoming-message.mp3',
          assetPath: 'public/assets/audio/incoming-message.mp3',
          audioChannelNum: 2,
          isUrl: false
        })
      }catch(e){
        throwError(e)
      }
    } else { // web for testing
      this.audio_incoming = new Audio()
      this.audio_incoming.src = "../../assets/audio/incoming-message.mp3"
    }

    // 8. The hearbeat to notify the server that the user is online
    if (this.heartbeat_interval)
      clearInterval(this.heartbeat_interval)
    this.heartbeat_interval = setInterval(()=>{
      this.contentService.post('/users-heartbeats', {}).subscribe(()=>null)
    }, 5000)

    // 9. When the user is back in the app, refresh the information
    if (!this.windowFocusRegistered){
      this.windowFocusRegistered = true
      console.log("register platform on resume")
      this.platform.resume.subscribe(async()=>{
        await (()=>new Promise(_=>setTimeout(_, 1500)))() // When the message master info doesn't update, try to increase the delay
        this.contentService.post('/chat/request-update/'+this.user.id, {})
        .subscribe(data => null)
      })
      /*window.addEventListener('focus', ()=>{
        this.feedbackService.register("User is back", "success")
        this.contentService.post('/chat/request-update/'+this.user.id, {})
        .subscribe(data => null)
      })*/
    }

    // 10. After navigation event, it should refresh the data
    /*this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event:NavigationEnd) => {
        this.platform.resume.next()
      })*/
  }

  navigateTo(url:string) {
    this.router.navigate([url])
  }

  // 5. The activity status
  isOnline:boolean = undefined
  onlineToggleForm = new FormGroup({
    'available': new FormControl(undefined),
    'unavailable': new FormControl(undefined)
  }) // No validators
  initializeOnlineStatusParameters(){
    // Initialization values
    let subs = this.contentService.userStorageObservable.getStorageObservable().subscribe((user)=>{
      for(let key in user.user_settings){
        if(this.onlineToggleForm.get(key)){
          this.onlineToggleForm.get(key).setValue(user.user_settings[key])
        }
      }
    })
    // Event Listener
    this.onlineToggleForm.valueChanges.subscribe((data)=>{
      let observables = []
      for (let key in data){
        if (data[key] === undefined || data[key] === null)
          continue
        let obj = {
          user_id: this.user.id,
          key: key,
          value: data[key]
        }
        observables.push(this.contentService.put('/user-settings', obj)
          .pipe(catchError(error=>{
            return throwError(error)
          }))
        )
      }
      merge(...observables)
        .pipe(debounceTime(1000))
        .subscribe(async()=>{
          console.log("Vos paramètres ont été mises à jour") // NO need to show feedback message
          this.user.user_settings = {
            ...this.user.user_settings, 
            ...(data['available'] != null)?{available:data['available']}:{},
            ...(data['unavailable'] != null)?{unavailable:data['unavailable']}:{},
          }
          this.contentService.userStorageObservable.updateStorage(this.user)
        })
    })
  }

  // 6. Showing messages for coach or for nutritionnist (only if the coach is connected)
  messageDetailsPrefix = '/chat/details/'
  displayMessageForForm = new FormControl(undefined)
  displayMessageForFormSubscription = null
  displayMessageForFormInit(){
    if (this.displayMessageForFormSubscription)
      this.displayMessageForFormSubscription.unsubscribe()
    this.displayMessageForFormSubscription = this.displayMessageForForm.valueChanges.subscribe((value)=>{
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
  navigateToDetails(entity){
    let unread = entity.unread
    if (unread > 0){
      this.chatService.unreadMessagesSubject.next(this.totalUnreadMessages - unread)
    }
    entity.unread = 0
    this.navigateTo('/chat/details/' + entity.id)
  }
  playIncomingMessageAudio(){
    if (this.platform.is('capacitor')){
      NativeAudio.play({assetId: 'incoming-message.mp3'})
      Haptics.vibrate()
    } else {
      this.audio_incoming.play()
    }
  }

  simulateResume(){
    this.platform.resume.next()
  }
}
