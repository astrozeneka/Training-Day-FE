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
import { Browser } from '@capacitor/browser';

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

    this.loadCorrespondent()

    this.chatService.registerChatEvents(this.correspondentId,  (p)=>{this.prepareDiscussionDetailsData(p)}, this.coachAsNutritionist)
  }

  loadCorrespondent(){
    this.contentService.getOne(`/users/`+this.correspondentId, {})
      .subscribe((data:any)=>{
        let url = data.thumbnail64 || data.profile_image?.permalink
        this.avatar_url = url ? this.contentService.addPrefix(url) : undefined
        this.correspondent = data
      })
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
    if (this.file) {
      obj.file = this.file
    }
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

  // 8. Another action sheet allowing to delete the whole discussion, or the coach to block user
  async presentActionSheetGlobal(){
    // Check if the correspondent have already disabled messages
    let messagesDisabled = (this.correspondent?.user_settings?.disable_messages == 'true') ?? false
    let as = await this.actionSheetController.create({
      'header': 'Action',
      'buttons': [
        {
          text: 'Supprimer la discussion',
          role: 'destructive', // e.g.
          data: {
            action: 'delete',
          },
        },
        ... (messagesDisabled?[{
          text: 'Débloquer l\'utilisateur',
          role: 'destructive',
          data: {
            action: 'unblock',
          },
        }]:[{
          text: 'Bloquer l\'utilisateur',
          role: 'destructive',
          data: {
            action: 'block',
          },
        }]),
        {
          text: "Annuler",
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        }
      ]})
    await as.present();
    const { data } = await as.onDidDismiss();
    if(data.action == 'delete'){
      this.contentService.delete('/messages/of-user', this.correspondentId)
        .subscribe((data)=>{
          this.feedbackService.registerNow("Discussion supprimée", 'success')
        })
    }else if(data.action == 'block'){
      this.contentService.post('/users/disable-messages', {
        user_id: this.correspondentId, 
        disabled: true
      })
      .subscribe((data)=>{
        this.feedbackService.registerNow("Discussion bloquée", 'success')
        this.loadCorrespondent()
      })
    }else if(data.action == 'unblock'){
      this.contentService.post('/users/disable-messages', {
        user_id: this.correspondentId, 
        disabled: false
      })
      .subscribe((data)=>{
        this.feedbackService.registerNow("Discussion débloquée", 'success')
        this.loadCorrespondent()
      }) 
    }else if(data.action == 'cancel'){
      // Nothing to do
    }
  }

  async presentActionSheetReport(){
    let as = await this.actionSheetController.create({
      'header': 'Action',
      'buttons': [
        {
          text: 'Suivi du poids',
          data: {
            action: 'weight',
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        }
      ]})
    await as.present();
    const { data } = await as.onDidDismiss();
    if(data.action == 'weight'){
      this.router.navigate(['/app-weight-tracking/'+this.correspondentId])
    }
  }

  // the #fileInput element
  @ViewChild('fileInput') fileInput:any = undefined
  file = undefined
  selectFile(){
    // Click the file input
    this.fileInput.nativeElement.click()
  }
  handleFileInput(event: any){
    let file = event.target.files[0]
    if(file){
      let reader = new FileReader()
      reader.onload = (e)=>{
        let base64 = reader.result as string
        // The file name
        this.file = {
          name: file.name,
          type: file.type,
          base64: base64
        }
      }
      reader.readAsDataURL(file)
    }
  }
    
  downloadFileById(id){
    this.contentService.getOne(`/files/details/`+id, {})
      .subscribe((data:any)=>{
        const byteString = atob(data.base64.split(',')[1]); // Decode base64
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([uint8Array], { type: data.type });
        const url = window.URL.createObjectURL(blob);
        Browser.open({ url: url });
      })
  }

}
