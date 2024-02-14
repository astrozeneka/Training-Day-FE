import {Component, OnInit, ViewChild} from '@angular/core';
import {ContentService} from "../../../content.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, ModalController} from "@ionic/angular";
import {FeedbackService} from "../../../feedback.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {send} from "ionicons/icons";

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
      this.loadData()
    })
  }

  ngOnInit() {
  }

  loadData() {
    this.contentService.get('/messages/details', 0, ""+this.correspondentId, "f_correspondent") // ไม่มี filter
      .subscribe(([data, metaInfo])=>{
        this.entityList = data as unknown as Array<any>
        this.correspondent = metaInfo['correspondent'];
        console.log(this.correspondent)
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
