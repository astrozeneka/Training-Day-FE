import {Component, OnInit, ViewChild} from '@angular/core';
import {ContentService} from "../../../content.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {ActionSheetController, AlertController, ModalController} from "@ionic/angular";
import {FeedbackService} from "../../../feedback.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {send} from "ionicons/icons";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import { Badge } from '@capawesome/capacitor-badge';
import {environment} from "../../../../environments/environment";
import {BroadcastingService} from "../../../broadcasting.service";
import { ChatService } from 'src/app/chat.service';

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.page.html',
  styleUrls: ['./chat-details.page.scss'],
})
export class ChatDetailsPage implements OnInit {
  entityList:Array<any> = []
  entityOffset:any = 0

  correspondentId = null
  correspondent:any|null = null
  user:any|null = null;
  avatar_url:any = undefined

  @ViewChild('discussionFlow') discussionFlow:any = undefined;

  form = new FormGroup({
    'content': new FormControl('', Validators.required)
  })

  echo: Echo = undefined;
  environment: any;
  recipient_id: any;

  constructor(
    private contentService:ContentService, // As it is a universally used service, the name should be shortened
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService, // Same for here
    private router:Router,
    private broadcastingService: BroadcastingService,
    private actionSheetController: ActionSheetController,

    private chatService: ChatService
  ) {
    this.route.params.subscribe(async params=>{
      // check if params['id'] begins with n_
      if(params['id'].startsWith('n_')){
        this.correspondentId = params['id'].replace('n_', '')
        this.coachAsNutritionist = true
        this.recipient_id = environment.nutritionistId
      }else{
        this.correspondentId = params['id']
      }
    })
    this.router.events.subscribe(async event=>{
      if(event instanceof NavigationEnd && this.router.url.includes('chat/details')) {
        Badge.clear();
      }
    })

    this.environment = environment
  }

  prepareDiscussionDetailsData({data, metadata}){
    let newMessageAdded = false
    const maxId = Math.max(...this.entityList.map((item:any)=>item.id)) // Not accurate, should use date instead (anyway, this function will be moved in another angular service)
    const shouldScrollTop = this.entityList.length == 0
    this.entityList = data.slice().reverse().concat(this.entityList.slice())
    // Filter by unique id
    let unique = {}
    this.entityList = this.entityList.filter((item:any)=>{
      if(unique[item.id])
        return false
      unique[item.id] = true
      return true
    })
    // Sort the entityList by date
    this.entityList.sort((a, b)=>b.created_at - a.created_at)
    // Only show undelivered is false
    this.entityList = this.entityList.filter((item:any)=>!item.undelivered)
    this.entityList.sort((a, b)=>a.id - b.id)
    this.entityOffset = this.entityList.length
    shouldScrollTop?this.scrollTop():"";
    const newMaxId = Math.max(...this.entityList.map((item:any)=>item.id))
    if (newMaxId > maxId) {
      newMessageAdded = true
      this.scrollTop()
    }

    this.ionInfiniteEvent?.target.complete()
  }

  async ngOnInit() {

    this.entityList = []

    this.contentService.userStorageObservable.getStorageObservable().subscribe(async (user)=>{
      this.user = user
      if (!this.coachAsNutritionist) {
        this.recipient_id = this.user.id
      }
    })

    this.contentService.getOne(`/users/`+this.correspondentId, {})
      .subscribe((data:any)=>{
        let url = data.thumbnail64 || data.profile_image?.permalink
        this.avatar_url = url ? this.contentService.addPrefix(url) : undefined
        this.correspondent = data
      })

    this.chatService.registerChatEvents(this.correspondentId,  (p)=>{this.prepareDiscussionDetailsData(p)}, this.coachAsNutritionist)


    /*
    console.log("chat-details: ngOnInit")

    this.contentService.userStorageObservable.getStorageObservable().subscribe(async (user)=>{
      this.user = user

      // Reset the entityList because we have a new user connected
      this.entityList = [] // Reset the component data
      await this.contentService.storage.set(`discussionDetailsData-${this.user.id}-${this.correspondentId}`, []) // Reset the storage data

      // 1. Load the correspondent data
      console.log("loading key: ", `discussionDetailsData-${this.user.id}-${this.correspondentId}`)
      let discussionDetailsData = await this.contentService.storage.get(`discussionDetailsData-${this.user.id}-${this.correspondentId}`)
      if(discussionDetailsData && (discussionDetailsData.length > 0)){
        this.entityList = discussionDetailsData.slice().reverse()
        this.entityOffset = this.entityList.length
        this.scrollTop()
      }

      // 2. register listener to listen update from the server
      this.contentService.getOne(`/users/`+this.correspondentId, {})
        .subscribe((data:any)=>{
          let url = data.thumbnail64 || data.profile_image?.permalink
          this.avatar_url = url ? this.contentService.addPrefix(url) : undefined
          this.correspondent = data
        })

      // 2.b. message data (need to listen)
      console.log('event-name: ', `message-details-updated-${this.correspondentId}`)
      this.broadcastingService.pusher.subscribe(`messages.${user.id}`)
        .bind( `message-details-updated-${this.correspondentId}`, (res)=>{ // TODO, should use the same format {data, metainfo}
          console.log("Request data from broadcasting: ", res)
          this.prepareDiscussionDetailsData(res)
          // console.log("Storing key: ", `discussionDetailsData-${this.user.id}-${this.correspondentId}`, this.entityList.slice().reverse())
          this.contentService.storage.set(`discussionDetailsData-${this.user.id}-${this.correspondentId}`, this.entityList.slice().reverse())
          this.ionInfiniteEvent?.target.complete()
        })

      await new Promise((resolve)=>setTimeout(resolve, 1000)) // Wait 1 second

      // 3. Request the server to get the latest data
      this.contentService.post('/messages/request-update/'+this.correspondentId, null)
        .subscribe(data => null)
    })
    */
  }

  scrollTop(){
    setTimeout(()=>{
      this.discussionFlow = document.querySelector('.discussion-flow')
      this.discussionFlow.scrollTop = this.discussionFlow.scrollHeight - this.discussionFlow.clientHeight;
    }, 20);
  }

  async sendMessage(){
    /*
      For the app performance, this code shoudl update both the local cache
      And the server database when sending message
    */
    if (!this.form.valid)
      return

    let obj:any = this.form.value;
    obj.recipient_id = this.correspondentId;
    obj.sender_id = (await this.contentService.storage.get('user')).id // Can be replaced by this.user.id (but need test first)
    this.contentService.post('/messages', obj)
      .subscribe(async(res)=>{ // Should handle error here
        console.log("Message sent")
      })

    obj.undelivered = true
    this.entityList.push(obj) // Should use a function, not only push
    this.scrollTop() // Should be included in the above described function
    this.form.reset()
  }

  ionInfiniteEvent = null
  onIonInfinite(event:any){
    this.ionInfiniteEvent = event
    /*this.contentService.post(`/messages/request-update/${this.correspondentId}`, {correspondent_id: this.correspondentId, offset: this.entityOffset})
      .subscribe((data)=>{
        console.log('Request message update (onIonInfinite): ', data)
      })*/
    this.chatService.loadMessages(this.correspondentId, this.entityOffset, (p)=>{this.prepareDiscussionDetailsData(p)})
  }

  // 3. Managing the action sheets for seleting message
  async presentActionSheet(messageId){
    console.log("Present actionsheet, ", messageId)
    let as = await this.actionSheetController.create({
      'header': 'Action',
      'buttons': [
        {
          text: 'Supprimer le message',
          role: 'destructive',
          data: {
            action: 'delete',
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ]
    })
    // present
    await as.present();
    const { data } = await as.onDidDismiss();
    if(data.action == 'delete'){
      this.contentService.delete('/messages', messageId)
      .subscribe((data)=>{
        this.feedbackService.registerNow("Message supprimé", 'success')
      })
    }
  }

  // 7. Allow the coach to use the nutritionist chat
  coachAsNutritionist: boolean = false

}
