import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ContentService} from "../../../content.service";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from "@angular/router";
import {ActionSheetController, AlertController, ModalController, Platform} from "@ionic/angular";
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
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Buffer } from "buffer";
import { catchError, debounceTime, filter, finalize, throwError } from 'rxjs';
import { ChatV3Service } from 'src/app/chat-v3.service';
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import IMessage from 'src/app/models/IMessages';
import MessageSubject from 'src/app/utils/MessageSubject';
import { FormComponent } from 'src/app/components/form.component';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.page.html',
  styleUrls: ['./chat-details.page.scss'],
})
export class ChatDetailsPage extends FormComponent implements OnInit, ViewWillEnter, ViewWillLeave {
  entityList:Array<any> = []
  entityIdList:Array<number> = []
  entityOffset:any = 0
  entityDateOffset:Date = new Date()

  correspondentId = null
  correspondent:any|null = null
  correspondentIsOnline:boolean = undefined

  user:any|null = null;
  avatar_url:any = undefined

  @ViewChild('discussionFlow') discussionFlow:any = undefined;

  override form = new FormGroup({
    'content': new FormControl('', Validators.required)
  })
  override displayedError = {
    'content': undefined
  }

  echo: Echo<any> = undefined;
  environment: any;
  recipient_id: any;

  // The chat event subscription
  chatEventSubscription = undefined
  navigationStartSubscription = undefined

  // Check whether the component is displayed or not
  componentIsActive = true

  // The new system of the chating v3
  messageSubject:MessageSubject = undefined
  allMessagesLoaded = false;
  // entityDict = {} (unused)

  // Custom scroll loading event
  scrollIsLoading = false
  scrollY = -0

  constructor(
    private contentService:ContentService, // As it is a universally used service, the name should be shortened
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService, // Same for here
    public router:Router,
    private broadcastingService: BroadcastingService,
    private actionSheetController: ActionSheetController,

    private chatService: ChatService, // Should not be used anymore, replaced by chatV3Service
    private platform: Platform,
    private cdr: ChangeDetectorRef,

    private chatV3Service: ChatV3Service,
  ) {
    super()
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

    // Handle the badge deletion
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd && this.router.url.includes('chat/details')),
      filter(event => this.componentIsActive) // Experimental
    ).subscribe(async () => {
      Badge.clear();
    });

    // The below code is not optimized
    /*this.navigationStartSubscription = this.router.events.pipe(
      filter((event) => event instanceof NavigationStart),
    ).subscribe((event: NavigationStart) => {
      console.log("Navigation start")
      this.navigationStartSubscription.unsubscribe()
      this.chatEventSubscription?.unsubscribe();
    })


    this.environment = environment
    console.log("Creating ChatDetailsPage")*/

    this.environment = environment
  }

  prepareDiscussionDetailsData({data, metadata}){
    if (data.length == 0) // This prevent from infinite loop
      return
    // Bug, this code is executed many many times causing a 429 error (only on mobile, not on web)
    console.log("**** prepare discussion details data")
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

    this.ionInfiniteEvent?.target?.complete()
    if (this.ionInfiniteEvent?.artificial){
      this.scrollTop()
    }


    // Experimental feature to fix the ion-ionic content that doesn't activate if the content height is lower than the container weight
    // select by css_selector
    let container = document.querySelector('.discussion-flow')
    let content = document.querySelector('.discussion-flow>div')

    // If content not overflow
    if (content.clientHeight < container.clientHeight) {
      this.onIonInfinite({artificial: true})
    }
    
  }

  async ngOnInit() {

    this.entityList = [];
    this.contentService.userStorageObservable.gso$()
      .pipe(filter((event)=>this.componentIsActive))
      .subscribe(async (user)=>{
        this.user = user
        if (!this.coachAsNutritionist) {
          this.recipient_id = this.user.id
        }

        this.messageSubject = await this.chatV3Service.loadMessages(this.user.id, this.correspondentId) // Initial load
        this.messageSubject.asObservable()
          .subscribe((messages:IMessage[]) => {
            // remove undelivered
            if (messages.length == 0)
              this.allMessagesLoaded = true
            else
              this.allMessagesLoaded = false
            this.entityList = this.entityList.filter((item:any)=>!item.undelivered)
            // For each data
            messages.forEach(message=>{
              if (this.entityIdList.includes(message.id)) {
                // Update existing
                let entity = this.entityList.find((item:any)=>item.id == message.id)
                entity.content = message.content
              }else{
                // Check if the message is an older one or a newer one
                // For later, use created_at instead of id
                if (this.entityList.length == 0 || this.entityList[0].created_at < message.created_at){
                  // Append new
                  this.entityList.push(message)
                  this.entityIdList.push(message.id)
                }else{
                  // Append old
                  this.entityList.unshift(message)
                  this.entityIdList.unshift(message.id)
                  this.entityDateOffset = message.created_at as Date
                }
              }
            })          
        })

      });

      this.loadCorrespondent();
    /*

    this.loadCorrespondent()

    this.chatEventSubscription = this.chatService.registerChatEvents(this.correspondentId,  (p)=>{this.prepareDiscussionDetailsData(p)}, this.coachAsNutritionist);
    */
   

    // Automated testing unit
    (window as any).typeMessage = (str)=>{
      this.form.get('content').setValue(str)
      this.form.get('content').markAsTouched()
    }

    // Manage the infinite scroll event manually
    this.discussionFlow = document.querySelector('.discussion-flow')
    this.discussionFlow.addEventListener('scroll', (event)=>{
      if (this.scrollIsLoading)
        return
      let y = event.target.scrollTop // here y < 0
      let height = event.target.scrollHeight
      let clientHeight = event.target.clientHeight
      this.scrollY = y
      if (-y + 500 > height - clientHeight){
        this.scrollIsLoading = true
        // Custom event
        this.ionInfiniteEvent = {target: {complete: ()=>{this.scrollIsLoading = false}}}
        this.onIonInfinite(this.ionInfiniteEvent)
      }
    })
  }

  loadCorrespondent(){
    this.contentService.getOne(`/users/`+this.correspondentId, {})
      .subscribe((data:any)=>{
        let url = data.thumbnail64 || data.profile_image?.permalink
        this.avatar_url = url ? this.contentService.addPrefix(url) : undefined
        this.correspondent = data

        // Availability of the coach
        this.correspondentIsOnline = this.correspondent.isAvailable
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
    if (!this.form.valid && !this.file)
      return

    let obj:any = this.form.value;
    obj.recipient_id = this.correspondentId;
    obj.sender_id = (await this.contentService.storage.get('user')).id // Can be replaced by this.user.id (but need test first)
    let postExtraOptions = {}
    if (this.file) {
      obj.file = this.file
      postExtraOptions = {
        observe: 'events',
        reportProgress: true
      }
    }
    this.contentService.post('/messages', obj, postExtraOptions)
      .pipe(
        catchError((error)=>{
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'content')
          }
          // Delete the undeliverable entity
          this.entityList = this.entityList.filter((item:any)=>!item.undelivered)
          return throwError(error)
        })
        ,finalize(()=>{
      }))
      .subscribe(async(event:any)=>{ // Should handle error here
        console.log(event.type)
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.loaded / event.total;
          obj.progress = progress
          console.log(obj.progress)
          this.cdr.detectChanges()
        }
      })

    obj.undelivered = true
    this.entityList.push(obj) // Should use a function, not only push
    this.scrollTop() // Should be included in the above described function


    this.clearFile()
    this.form.reset()
  }

  ionInfiniteEvent = null
  onIonInfinite(event:any){ // It doesn't work
    this.chatV3Service.loadMoreMessages(this.user.id, this.correspondentId, this.entityDateOffset,
      async ()=>{
        event.target.complete()
      }
    )

    /*
    this.chatV3Service.loadMoreMessages(this.user.id, this.correspondentId, this.entityDateOffset,
      async ()=>{
        // Try to simulate fake content to the observable

        await (new Promise(resolve => setTimeout(resolve, 3000)))
        console.log('finished')
        event.target.complete()
        this.messageSubject.next([
          {
            id: 1,
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
            sender_id: 1,
            recipient_id: 2,
            file_id: null,
            content: 'This is a fake message',
            is_read: 0,
            file: null
          },
          {
            id: 2,
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
            sender_id: 1,
            recipient_id: 2,
            file_id: null,
            content: 'This is another fake message',
            is_read: 0,
            file: null
          },
          {
            id: 3,
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
            sender_id: 1,
            recipient_id: 2,
            file_id: null,
            content: 'This is another fake message',
            is_read: 0,
            file: null
          },
          {
            id: 4,
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
            sender_id: 1,
            recipient_id: 2,
            file_id: null,
            content: 'This is another fake message',
            is_read: 0,
            file: null
          },
          {
            id: 5,
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
            sender_id: 1,
            recipient_id: 2,
            file_id: null,
            content: 'This is another fake message',
            is_read: 0,
            file: null
          },
          {
            id: 6,
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
            sender_id: 1,
            recipient_id: 2,
            file_id: null,
            content: 'This is another fake message',
            is_read: 0,
            file: null
          }
        ])

      }
    )
    */
    //this.messageSubject.loadMore()
    /*this.contentService.post(`/messages/request-update/${this.correspondentId}`, {correspondent_id: this.correspondentId, offset: this.entityOffset})
      .subscribe((data)=>{
        console.log('Request message update (onIonInfinite): ', data)
      })*/
    //this.chatService.loadMessages(this.correspondentId, this.entityOffset, (p)=>{this.prepareDiscussionDetailsData(p)})
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
    let userLocked = (this.correspondent?.user_settings?.locked == 'true') ?? false
    let messagesDisabled = (this.correspondent?.user_settings?.disable_messages == 'true') ?? false
    let coachMessagesDisabled = (this.correspondent?.user_settings?.disable_coach_messages == 'true') ?? false
    let nutritionistMessagesDisabled = (this.correspondent?.user_settings?.disable_nutritionist_messages == 'true') ?? false
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
        ... (userLocked?[{
          text: "Débloquer l'utilisateur",
          role: 'destructive',
          data: {
            action: 'set locked false',
          },
        }]:[{
          text: "Bloquer l'utilisateur pour non respect des règlements",
          role: 'destructive',
          data: {
            action: 'set locked true',
          },
        }]),
        ... (coachMessagesDisabled?[{
          text: 'Débloquer la messagerie du coach',
          role: 'destructive',
          data: {
            action: 'set disable_coach_messages false',
          },
        }]:[{
          text: 'Bloquer la messagerie du coach',
          role: 'destructive',
          data: {
            action: 'set disable_coach_messages true',
          },
        }]),
        ... (nutritionistMessagesDisabled?[{
          text: 'Débloquer la messagerie du nutritionniste',
          role: 'destructive',
          data: {
            action: 'set disable_nutritionist_messages false',
          },
        }]:[{
          text: 'Bloquer la messagerie du nutritionniste',
          role: 'destructive',
          data: {
            action: 'set disable_nutritionist_messages true',
          },
        }]),
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
    if(data.action == 'delete'){
      this.contentService.delete('/messages/of-user', this.correspondentId)
        .subscribe((data)=>{
          this.feedbackService.registerNow("Discussion supprimée", 'success')
        })
    }else if (data.action.includes("set ")){
      let [_, key, value] = data.action.split(' ')
      this.contentService.post('/users/disable-messages', {
        user_id: this.correspondentId,
        key: key,
        disabled: value == 'true'
      }).subscribe((data)=>{
        if (key == 'locked') {
          let message = "Utilisateur " + (value == 'true'?'bloqué':'débloqué');
          this.feedbackService.registerNow(message, 'success')
        }else{
          let message = "Messagerie du " + (key.includes('coach')?'coach':'nutritionniste') + " " + (value == 'true'?'bloquée':'débloquée');
          this.feedbackService.registerNow(message, 'success')
        }
        this.loadCorrespondent()
      })
    }else if(data.action == 'block'){ // NOT USED ANYMORE, should be deleted
      this.contentService.post('/users/disable-messages', {
        user_id: this.correspondentId, 
        disabled: true
      })
      .subscribe((data)=>{
        this.feedbackService.registerNow("Discussion bloquée", 'success')
        this.loadCorrespondent()
      })
    }else if(data.action == 'unblock'){ // NOT USED ANYMORE, should be deleted
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
          text: 'Fixer un rendez-vous',
          data: {
            action: 'appointment',
          }
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
    if(data.action == 'appointment'){
      this.router.navigate(['/set-appointment/'+this.correspondentId])
    }
  }

  // the #fileInput element
  @ViewChild('fileInput') fileInput:any = undefined
  file = undefined
  async selectFile(type: 'file'|'image'|'media'|'video'){
    // Click the file input
    // this.fileInput.nativeElement.click() // Old code for picking files
    // Check permissions
    /*const result = await FilePicker.checkPermissions(); // Doesn't work
    console.log("Permission Checking")
    console.log(result)*/

    // Launch the file picker
    if (this.platform.is('capacitor')) {
      let result;
      try{
        console.log("Type: "+type)
        if (type == 'image'){
          result = await FilePicker.pickImages({
            limit: 1,
            readData: true,
            skipTranscoding: true
          })
        } else if (type == 'video'){
          result = await FilePicker.pickVideos({
            limit: 1,
            readData: true
          })
        } else if (type == 'media'){
          result = await FilePicker.pickMedia({
            limit: 1,
            readData: true
          })
        } else if (type == 'file'){
          result = await FilePicker.pickFiles({
            limit: 1,
            readData: true
          })
        }
      }catch(e){
        return;
      }
      if (result['files'].length > 0) { // == 1
        let file = result["files"][0]
        let data = result.files[0].data
        data = "data:" + file.mimeType + ";base64," + data
        // Sanitize file size here

        this.file = {
          name: file.name,
          type: file.mimeType,
          base64: data
        }
      }
      
      /*
      "files":[
        {"path":"file:///var/mobile/Containers/Data/Application/8F9722BE-45ED-4BC4-95DA-8541AA4CF844/Library/Caches/2378F1B0-2A19-47C3-86E6-B7DB622D898F/barcodes_100001_100010.pdf","mimeType":"application/pdf","name":"barcodes_100001_100010.pdf","modifiedAt":1724604832959,"size":41311}]}
        , ...]
      */
    }else{ // On the web
      this.fileInput.nativeElement.click()
    }
  }
   
  
  handleFileInput(event: any){ // Doesn't work in iOS anymore since update
    let file = event.target.files[0]
    if(file){
      try{
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
      }catch(e){
        return;
      }
    }else{
      // this.feedbackService.registerNow("No file selected", 'danger')
    }
  }

  downloadMessageFile(message){
    if (message.undelivered || message.fileIsLoading) {
      return
    } else {
      message.fileIsLoading = true;
      this.contentService.getOne(`/files/details/`+message.file.id,{})
        .subscribe((data: any) => {
          let url = environment.rootEndpoint + '/' + data.permalink
          Browser.open({ url: url });
          message.fileIsLoading = false;
        })
    }
  }
    
  private _downloadFileById(id){ // Deprecated, not used anymore
    this.contentService.getOne(`/files/details/`+id, {})
      .subscribe((data:any)=>{
        let url = environment.rootEndpoint + '/' + data.permalink
        Browser.open({ url: url });
        // The code below is the old code (will be deleted later)
        /*const byteString = atob(data.base64.split(',')[1]); // Decode base64
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([uint8Array], { type: data.type });
        const url = window.URL.createObjectURL(blob);
        Browser.open({ url: url });*/
      })
  }


  // Debug features
  async presentDebugActionSheet(){
    let as = await this.actionSheetController.create({
      'header': 'Action',
      'buttons': [
        {
          text: 'Clear Cache',
          data: {
            action: 'clear-cache',
          },
        },
        {
          text: 'Scroll top',
          data: {
            action: 'scroll-top'
          }
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
    if(data.action == 'clear-cache'){
      this.chatService.clearCache(this.correspondentId)
      this.chatV3Service.clearCache(this.user.id, this.correspondentId)
      this.feedbackService.registerNow("Cache cleared", 'success')
    }else if(data.action == 'scroll-top'){
      this.scrollTop()
    }
  }

  deleteAppointment(id){
    // Show an alert to confirm the deletion
    this.alertController.create({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer ce rendez-vous ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Supprimer',
          handler: ()=>{
            this.contentService.delete('/appointments', id)
              .subscribe((response)=>{
                this.feedbackService.registerNow("Rendez-vous supprimé", 'success')
                this.loadCorrespondent()
              })
          }
        }
      ]
    }).then((alert)=>{
      alert.present()
    })
  }

  clearFile(){
    this.file = undefined
    this.cdr.detectChanges() // important
  }

  // Managing router state
  ionViewWillLeave(): void {
    this.componentIsActive = false
  }
  ionViewWillEnter(): void {
    this.componentIsActive = true
    // Scroll to the last scrollY position
    this.discussionFlow = document.querySelector('.discussion-flow')
    this.discussionFlow.scrollTop = this.scrollY
  }

  // 11. The bottom menu allowing to specify we want to send "File" or Image
  async presentActionSheetFile(){
    if (this.platform.is('capacitor')){
      let as = await this.actionSheetController.create({
        'header': 'Action',
        'buttons': [
          {
            text: 'Envoyer un fichier',
            data: {
              action: 'file',
            },
          },
          {
            text: 'Envoyer une image',
            data: {
              action: 'image',
            },
          },
          /*{
            text: 'Envoyer une vidéo',
            data: {
              action: 'video',
            },
          },*/
          /*{
            text: 'Envoyer un média',
            data: {
              action: 'media',
            },
          },*/
          {
            text: 'Annuler',
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          }
        ]})
      await as.present();
      // Role
      const { data } = await as.onDidDismiss();
      if(['file', 'image', 'media', 'video'].includes(data.action)){
        this.selectFile(data.action)
      }
    }else{
      this.fileInput.nativeElement.click()
    }
  }
}
