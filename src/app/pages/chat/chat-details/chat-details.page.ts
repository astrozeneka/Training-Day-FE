import {Component, OnInit, ViewChild} from '@angular/core';
import {ContentService} from "../../../content.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {AlertController, ModalController} from "@ionic/angular";
import {FeedbackService} from "../../../feedback.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {send} from "ionicons/icons";
import Pusher from "pusher-js";
import Echo from "laravel-echo";

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.page.html',
  styleUrls: ['./chat-details.page.scss'],
})
export class ChatDetailsPage implements OnInit {
  entityList:Array<any>|null = []

  correspondentId = null
  correspondent:any|null = null
  user:any|null = null;

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
            this.entityList = data
          });
        })


      }
    })
  }

  ngOnInit() {
  }

  loadData() {
    this.contentService.get('/messages/details', 0, ""+this.correspondentId, "f_correspondent") // ไม่มี filter
      .subscribe(([data, metaInfo])=>{
        this.entityList = data as unknown as Array<any>
        this.correspondent = metaInfo['correspondent'];
        // Make the scrollable stick to bottom
        setTimeout(()=>{
          this.discussionFlow = document.querySelector('.discussion-flow')
          this.discussionFlow.scrollTop = this.discussionFlow.scrollHeight - this.discussionFlow.clientHeight;
        }, 20);
      })
  }

  async sendMessage(){
    if (!this.form.valid)
      return
    let obj:any = this.form.value;
    obj.recipient_id = this.correspondentId;
    obj.sender_id = (await this.contentService.storage.get('user')).id
    this.contentService.post('/messages', obj)
      .subscribe(async(res)=>{
        this.loadData();
      })
    this.form.reset()
  }

  protected readonly send = send;
}
