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
      this.user = await this.contentService.storage.get('user')
      this.loadData();
    })
    this.router.events.subscribe(async event=>{
      if(event instanceof NavigationEnd && this.router.url.includes('chat/details')) {
        //Pusher.logToConsole = true;
        /*let pusher = new Pusher('app-key', {
          cluster: environment.pusher_cluster,
          httpHost: environment.pusher_host,
          wsHost: environment.pusher_host,
          httpPort: environment.pusher_port,
          wsPort: environment.pusher_port,
          wssPort: environment.pusher_port,
          forceTLS: false, // Hard coded
          disableStats: true, // hard coded
          enabledTransports: ['ws', 'wss'], // Hard coded

        });*/
        /*
        this.contentService.storage.get('user').then(async user=>{
          var channel = broadcastingService.pusher.subscribe('messages.'+user.id);
          channel.bind('message-dispatched',  (data: any)=>{
            // The chat content should be updated with the new messages
            data.reverse()
            this.entityList = data
            this.scrollTop()
          });
        })

         */
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
    console.log("Here, ngOnInit")
    let user = await this.contentService.storage.get('user')
    // CorrespondentId is already loaded
    // 1. Load from the localstorage to make the app run faster (moved below)
    let shouldInitUpdate = true
    let discussionDetailsData = await this.contentService.storage.get('discussionDetailsData-' + this.correspondentId)
    console.log(discussionDetailsData)
    if(discussionDetailsData && (discussionDetailsData.length > 0)){
      console.log("Retrieve saved data", discussionDetailsData)
      this.entityList = discussionDetailsData.slice().reverse()
      this.entityOffset = this.entityList.length
      this.scrollTop()

    }


    // 2. register listener to listen update from the server
    // 2.a. correspondent data (no need to listen, only load once)
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
        console.log("Message details updated: ", res)
        this.prepareDiscussionDetailsData(res)
        //console.log("Save data to local storage " + 'discussionDetailsData-' + this.correspondentId, this.entityList.slice())

        this.contentService.storage.set('discussionDetailsData-' + this.correspondentId, this.entityList.slice().reverse())
        this.ionInfiniteEvent?.target.complete()
      })
    await new Promise((resolve)=>setTimeout(resolve, 1000)) // Wait 1 second

    // 3. Request the server to get the latest data
    this.contentService.post('/messages/request-update/'+this.correspondentId, null)
      .subscribe((data)=>{
        console.log('Request message update: ', data)
      })
  }

  loadData() {
    /*
    // 1. Load the correspondent data
    this.contentService.getOne('/users/'+this.correspondentId, {})
      .subscribe((data:any)=>{
        // let profile_image = data.profile_image
        let url = data.thumbnail64 || data.profile_image?.permalink
        this.avatar_url = url ? this.contentService.addPrefix(url) : undefined
          //this.contentService.addPrefix(data.profile_image?.permalink)
        this.correspondent = data
      })

    // 2. Load the message data
    this.contentService.get('/messages/details', this.entityOffset, ""+this.correspondentId, "f_correspondent") // ไม่มี filter
      .subscribe(([data, metaInfo])=>{
        data.reverse()
        this.entityList = data as unknown as Array<any>
        this.entityOffset = this.entityList.length
        this.correspondent = metaInfo['correspondent'];
        this.scrollTop()
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

    /*
    let obj:any = this.form.value;
    obj.recipient_id = this.correspondentId;
    obj.sender_id = (await this.contentService.storage.get('user')).id
    this.contentService.post('/messages', obj)
      .subscribe(async(res)=>{
        this.entityList = this.entityList.filter((message:any)=>!message.undelivered)
        this.entityList = this.entityList?.concat(res)
        this.entityOffset = this.entityList?.length
      })
    this.form.reset()
    obj.undelivered = true
    this.entityList.push(obj)

     */
  }

  ionInfiniteEvent = null
  onIonInfinite(event:any){
    this.ionInfiniteEvent = event
    console.log("On Ion Infinite, send a request to the server to get more messages")
    this.contentService.post(`/messages/request-update/${this.correspondentId}`, {correspondent_id: this.correspondentId, offset: this.entityOffset})
      .subscribe((data)=>{
        console.log('Request message update (onIonInfinite): ', data)
      })

    /*
    this.entityOffset = this.entityList?.length // Refresh, because the entityList array might be updated by pusher
    console.log("On Ion Infinite")
    // Load additionnal content from the backend
    this.contentService.get('/messages/details', this.entityOffset, ""+this.correspondentId, "f_correspondent")
      .subscribe(([data, metaInfo])=>{
        data.reverse()
        this.entityList = this.entityList.filter((message:any)=>!message.undelivered) // Remove the undelivered messages
        this.entityList = data.concat(this.entityList)
        this.entityOffset = this.entityList?.length
        event.target.complete()
      })

     */
  }
}
