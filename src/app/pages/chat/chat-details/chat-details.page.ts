import {Component, OnInit, ViewChild} from '@angular/core';
import {ContentService} from "../../../content.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {AlertController, ModalController} from "@ionic/angular";
import {FeedbackService} from "../../../feedback.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {send} from "ionicons/icons";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import { Badge } from '@capawesome/capacitor-badge';
import {environment} from "../../../../environments/environment";
import {BroadcastingService} from "../../../broadcasting.service";

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

  constructor(
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService,
    private router:Router,
    private broadcastingService: BroadcastingService
  ) {
    this.route.params.subscribe(async params=>{
      this.correspondentId = params['id']
    })
    this.router.events.subscribe(async event=>{
      if(event instanceof NavigationEnd && this.router.url.includes('chat/details')) {
        Badge.clear();
      }
    })
  }

  prepareDiscussionDetailsData({data, metadata}){
    let newMessageAdded = false
    const maxId = Math.max(...this.entityList.map((item:any)=>item.id))
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
  }

  async ngOnInit() {
    this.contentService.userStorageObservable.getStorageObservable().subscribe(async (user)=>{
      this.user = user
      // Globally, it works fine, but still have some unreproductible bugs
      // The chat on two devices are not the same, will be fixed later
      // This probably need to be fixed by other projects, then we can use this feature

      // 1. Load the correspondent data
      let discussionDetailsData = await this.contentService.storage.get(`discussionDetailsData-${this.user.id}-${this.correspondentId}`)
      console.log(discussionDetailsData)
      if(discussionDetailsData && (discussionDetailsData.length > 0)){
        console.log("Retrieve saved data", discussionDetailsData)
        this.entityList = discussionDetailsData.slice().reverse()
        this.entityOffset = this.entityList.length
        this.scrollTop()
      }

      // 2. register listener to listen update from the server
      this.contentService.getOne('/users/'+this.correspondentId, {})
        .subscribe((data:any)=>{
          let url = data.thumbnail64 || data.profile_image?.permalink
          this.avatar_url = url ? this.contentService.addPrefix(url) : undefined
          this.correspondent = data
        })

      // 2.b. message data (need to listen)
      console.log('event-name: ', `message-details-updated-${this.correspondentId}`)
      this.broadcastingService.pusher.subscribe(`messages.${user.id}`)
        .bind( `message-details-updated-${this.correspondentId}`, (res)=>{ // TODO, should use the same format {data, metainfo}
          this.prepareDiscussionDetailsData(res)
          this.contentService.storage.set(`discussionDetailsData-${this.user.id}-${this.correspondentId}`, this.entityList.slice().reverse())
          this.ionInfiniteEvent?.target.complete()
        })

      await new Promise((resolve)=>setTimeout(resolve, 1000)) // Wait 1 second

      // 3. Request the server to get the latest data
      this.contentService.post('/messages/request-update/'+this.correspondentId, null)
        .subscribe(data => null)
    })
  }

  scrollTop(){
    setTimeout(()=>{
      this.discussionFlow = document.querySelector('.discussion-flow')
      this.discussionFlow.scrollTop = this.discussionFlow.scrollHeight - this.discussionFlow.clientHeight;
    }, 20);
  }

  async sendMessage(){
    if (!this.form.valid)
      return

    let obj:any = this.form.value;
    obj.recipient_id = this.correspondentId;
    obj.sender_id = (await this.contentService.storage.get('user')).id
    this.contentService.post('/messages', obj)
      .subscribe(async(res)=>{
        console.log("Message sent")
      })

    obj.undelivered = true
    this.entityList.push(obj)
    this.scrollTop()
    this.form.reset()
  }

  ionInfiniteEvent = null
  onIonInfinite(event:any){
    this.ionInfiniteEvent = event
    console.log("On Ion Infinite, send a request to the server to get more messages")
    this.contentService.post(`/messages/request-update/${this.correspondentId}`, {correspondent_id: this.correspondentId, offset: this.entityOffset})
      .subscribe((data)=>{
        console.log('Request message update (onIonInfinite): ', data)
      })
  }
}
