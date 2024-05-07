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

  constructor(
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService,
    private router:Router
  ) {
    this.route.params.subscribe(async params=>{
      this.correspondentId = params['id']
      this.user = await this.contentService.storage.get('user')
      this.loadData();
    })
    this.router.events.subscribe(async event=>{
      if(event instanceof NavigationEnd && this.router.url.includes('chat/details')) {
        Pusher.logToConsole = true;

        let pusher = new Pusher('9918c0cd2a9e368dde8f', {
          cluster: 'eu'
        });

        this.contentService.storage.get('user').then(async user=>{
          var channel = pusher.subscribe('messages.'+user.id);
          channel.bind('message-dispatched',  (data: any)=>{
            // The chat content should be updated with the new messages
            data.reverse()
            this.entityList = data
            this.scrollTop()
          });
        })
        Badge.clear();
      }
    })
  }

  ngOnInit() {
  }

  loadData() {
    // 1. Load the correspondent data
    this.contentService.getOne('/users/'+this.correspondentId, {})
      .subscribe((data:any)=>{
        let profile_image = data.profile_image
        this.avatar_url = profile_image ? this.contentService.addPrefix(profile_image.permalink) : undefined
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
        this.entityList = this.entityList?.concat(res)
        this.entityOffset = this.entityList?.length
      })
    this.form.reset()
  }

  onIonInfinite(event:any){
    this.entityOffset = this.entityList?.length // Refresh, because the entityList array might be updated by pusher
    console.log("On Ion Infinite")
    // Load additionnal content from the backend
    this.contentService.get('/messages/details', this.entityOffset, ""+this.correspondentId, "f_correspondent")
      .subscribe(([data, metaInfo])=>{
        data.reverse()
        this.entityList = data.concat(this.entityList)
        this.entityOffset = this.entityList?.length
        event.target.complete()
      })
  }
}
