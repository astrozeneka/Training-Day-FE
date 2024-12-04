import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, filter, forkJoin, tap, throwError } from 'rxjs';
import { ChatV4Service } from 'src/app/chat-v4.service';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { isEqual } from 'lodash';
import IMessage from 'src/app/models/IMessages';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Badge } from '@capawesome/capacitor-badge';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Platform, ActionSheetController, AlertController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { FeedbackService } from 'src/app/feedback.service';
import { HttpEventType } from '@angular/common/http';
import { CoachChatMasterService } from 'src/app/coach-chat-master.service';
const distinctUntilObjectChanged = distinctUntilChanged((a, b) => isEqual(a, b))

interface IFile {
  name:string,
  type: string,
  base64: any
}

interface UserWithAvatar extends User  {
  avatar_url: string
}

@Component({
  selector: 'app-chat-detail-v4',
  templateUrl: './chat-detail-v4.page.html',
  styleUrls: ['./chat-detail-v4.page.scss'],
})
export class ChatDetailV4Page implements OnInit, AfterViewInit {
  form = new FormGroup({
    'content': new FormControl('', Validators.required)
  })
  displayedError = {
    'content': undefined
  }
  
  // The discussion flow
  @ViewChild('discussionFlow') discussionFlow:ElementRef = undefined;

  // The file
  @ViewChild('fileInput') fileInput:any = undefined
  file:IFile = null

  // The current user and correspondent user
  user: User|null = null;
  correspondent: UserWithAvatar|null = null;
  // The message loading related data
  offset:Date = new Date()
  
  // Experimental (might be changed in the future)
  messageList: IMessage[] = []

  // A bunch of controls that are copied from the old version (may be optimized in the future)
  scrollIsLoading:boolean = false
  scrollY = -0
  infiniteEvent:{target:any}|null = null
  onInfinite(event:{target:any}){
    this.cv4s.triggerLoadMore(this.user.id, this.correspondent.id, this.offset, true, false)
      .then((_:void)=>{
        event?.target.complete()
      })
  }

  // Check whether the component is displayed or not (same as in the old codebase)
  componentIsActive = true

  constructor(
    private cs: ContentService,
    private cv4s: ChatV4Service,
    private route: ActivatedRoute,
    private platform: Platform,
    private actionSheetController: ActionSheetController,
    private cdr: ChangeDetectorRef,
    private fs: FeedbackService,
    private alertController:AlertController,
    public router: Router,
    private ccms: CoachChatMasterService
  ) { }

  async ngOnInit() {
    // Fetch the route parameter id, It can be called multiple times in the component lifecycle, so we don't use Promise
    this.route.params.subscribe(params => {
      let userId = params['userId'];
      let correspondentId = params['correspondentId'];
      // Load user and correspondnet data
      let user$ = this.cv4s.onUserByIdData(userId, true, true)
      let correspondent$ = this.cv4s.onUserByIdData(correspondentId, true, true)
      
      combineLatest([user$, correspondent$])
        .pipe(distinctUntilChanged((a, b) => isEqual(a, b)))
        .subscribe(([user, correspondent])=>{
          console.log("HHHH", correspondent.user_settings?.locked)
          this.user = user as User;
          this.correspondent = correspondent as UserWithAvatar;
          this._initializeMessages(); 

          // Prepare correspondent avatar (same as the old codebase)
          let url = correspondent.thumbnail64 || correspondent.profile_image?.permalink
          this.correspondent.avatar_url = url ? `${environment.rootEndpoint}/storage/${url}` : '/assets/samples/profile-sample-1.jpg'
        })
      
      // Reset master chip count
      this.ccms.resetBadgeForCorrespondent(userId, correspondentId)
    });

    // Handle badge (same as the old codebase)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd && this.router.url.includes('chat/details')),
      filter(event => this.componentIsActive) // Experimental
    ).subscribe(async () => {
      Badge.clear();
    });
  }

  async ngAfterViewInit (){
    console.log(this.discussionFlow)
    this.discussionFlow?.nativeElement.addEventListener('scroll', (event)=>{
      // The code below is a copy from 'chat-details.page.ts'
      if (this.scrollIsLoading)
        return
      let y = event.target.scrollTop // here y < 0
      let height = event.target.scrollHeight
      let clientHeight = event.target.clientHeight
      this.scrollY = y
      if (-y + 500 > height - clientHeight){
        this.scrollIsLoading = true
        this.infiniteEvent = {target: {complete: ()=>{this.scrollIsLoading = false}}}
        this.onInfinite(this.infiniteEvent)
      }
    })
  }

  private _initializeMessages() {
    this.cv4s.onMessages(this.user.id, this.correspondent.id, this.offset, true, true)
      .subscribe(messages=>{
        // console.log(messages)
        this._updateMessageList(messages)
      })
  }

  private _updateMessageList(messages: IMessage[]) {
    messages.forEach(message => {
      let existing = this.messageList.findIndex(m => m.id == message.id)
      if (existing != -1) { // Update existing elements
        this.messageList[existing] = message
      } else { // Append new elements
        let index = this._findInsertIndex(message)
        this.messageList.splice(index, 0, message)
      }
    })
    // Remove undelivered message
    let undeliveredIds = this.messageList.filter(m=>(m as any).undelivered).map(m=>m.id)
    this.messageList = this.messageList.filter(m=>!undeliveredIds.includes(m.id))
    // Update the date offset (the oldest loaded message)
    if (messages.length > 0) {
      this.offset = this.messageList[this.messageList.length - 1].created_at as Date
      // console.log(this.offset)
    }
  }

  private _findInsertIndex(message: IMessage){
    // Optimized algorithm for sorted array
    let low = 0;
    let high = this.messageList.length;
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if (this.messageList[mid].created_at > message.created_at) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  public __loadMore() {
    this.cv4s.triggerLoadMore(this.user.id, this.correspondent.id, this.offset, true, true)
  }

  public clearCache(){
    this.cv4s.clearCache(this.user.id, this.correspondent.id)
  }

  public async sendMessage(){
    if (!this.form.valid && !this.file)
      return

    // The code below (except symbols) are the same as from old version
    let payload = {
      ...this.form.value,
      recipient_id: this.correspondent.id,
      sender_id: this.user.id,
      progress: undefined
    }
    let postExtraOptions = {}
    if (this.file) {
      (payload as any).file = this.file
      postExtraOptions = {
        observe: 'events',
        reportProgress: true
      }
    }

    this.cs.post('/messages', payload, postExtraOptions)
      .pipe(catchError((error)=>{
        console.log(error)
        return throwError(()=>error)
      }))
      .subscribe(async(event:any)=>{
        if (event.type == HttpEventType.UploadProgress) {
          const progress = event.loaded / event.total;
          payload.progress = progress
          this.cdr.detectChanges
        }
      });
    
    // Temporarily append the message to the list for better UX
    (payload as any).undelivered = true
    this.messageList.unshift(payload as any as IMessage)

    // Reset form
    this.clearFile()
    this.form.reset()
  }

  async selectFile(type: 'file'|'image'|'media'|'video'){
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

  public async presentMessageActionSheet(messageId: number) {
    // Same code as in the old version
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
      this.cs.delete('/messages', messageId as any)
      .subscribe((data)=>{
        this.fs.registerNow("Message supprimé", 'success')
      })
    }
  }

  public async presentFileActionSheet() {
    // Same code as in the old version

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

  handleFileInput(event: any){
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
    if (message.undelivered || message.fileIsLoading){
      return
    } else {
      message.fileIsLoading = true;
      this.cs.getOne(`/files/details/`+message.file.id,{})
        .subscribe((data: any) => {
          let url = environment.rootEndpoint + '/' + data.permalink
          Browser.open({ url: url });
          message.fileIsLoading = false;
        })
    }
  }

  // Same as for the old version
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
      this.router.navigate(['/app-weight-tracking/'+this.correspondent.id])
    }
    if(data.action == 'appointment'){
      this.router.navigate(['/set-appointment/'+this.correspondent.id])
    }
  }

  async presentActionSheetGlobal(){
    // Check if the correspondent have already disabled messages
    /*
    let userLocked = (this.correspondent?.user_settings?.locked == 'true') ?? false
    let messagesDisabled = (this.correspondent?.user_settings?.disable_messages == 'true') ?? false
    let coachMessagesDisabled = (this.correspondent?.user_settings?.disable_coach_messages == 'true') ?? false
    let nutritionistMessagesDisabled = (this.correspondent?.user_settings?.disable_nutritionist_messages == 'true') ?? false
    */
    let userLocked = (this.correspondent?.user_settings?.locked == 'true')
    let messagesDisabled = (this.correspondent?.user_settings?.disable_messages == 'true')
    let coachMessagesDisabled = (this.correspondent?.user_settings?.disable_coach_messages == 'true')
    let nutritionistMessagesDisabled = (this.correspondent?.user_settings?.disable_nutritionist_messages == 'true')
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
      this.cs.delete('/messages/of-user', `${this.correspondent?.id}`)
        .subscribe((data)=>{
          this.fs.registerNow("Discussion supprimée", 'success')
        })
    }else if (data.action.includes("set ")){
      let [_, key, value] = data.action.split(' ')
      this.cs.post('/users/disable-messages', {
        user_id: this.correspondent.id,
        key: key,
        disabled: value == 'true'
      }).subscribe((data)=>{
        if (key == 'locked') {
          let message = "Utilisateur " + (value == 'true'?'bloqué':'débloqué');
          this.fs.registerNow(message, 'success')
        }else{
          let message = "Messagerie du " + (key.includes('coach')?'coach':'nutritionniste') + " " + (value == 'true'?'bloquée':'débloquée');
          this.fs.registerNow(message, 'success')
        }
        this.loadCorrespondent()
      })
    }else if(data.action == 'block'){ // NOT USED ANYMORE, should be deleted
      this.cs.post('/users/disable-messages', {
        user_id: this.correspondent.id, 
        disabled: true
      })
      .subscribe((data)=>{
        this.fs.registerNow("Discussion bloquée", 'success')
        this.loadCorrespondent()
      })
    }else if(data.action == 'unblock'){ // NOT USED ANYMORE, should be deleted
      this.cs.post('/users/disable-messages', {
        user_id: this.correspondent.id, 
        disabled: false
      })
      .subscribe((data)=>{
        this.fs.registerNow("Discussion débloquée", 'success')
        this.loadCorrespondent()
      }) 
    }else if(data.action == 'cancel'){
      // Nothing to do
    }
  }

  public loadCorrespondent(){
    this.cs.getOne(`/users/`+this.correspondent.id, {})
      .subscribe((data:User)=>{
        this.correspondent = {...this.correspondent, ...data}
      })
  }

  public async presentDebugActionSheet(){
    let as = await this.actionSheetController.create({
      'header': 'Action',
      'buttons': [
        {
          text: 'Clear Cache',
          data: {
            action: 'clear-cache',
          },
        },
        /*{
          text: 'Scroll top',
          data: {
            action: 'scroll-top'
          }
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
    const { data } = await as.onDidDismiss();
    if(data.action == 'clear-cache'){
      this.cv4s.clearCache(this.user.id, this.correspondent.id)
      this.fs.registerNow("Cache cleared", 'success')
    }/*else if(data.action == 'scroll-top'){
      this.scrollTop()
    }*/
  }

  clearFile(){
    this.file = undefined
    this.cdr.detectChanges() // important
  }

  // Managing router state (same as in the old codebase)
  ionViewWillLeave(): void {
    this.componentIsActive = false
  }
  // Managing router state (same as in the old codebase)
  ionViewWillEnter(): void {
    this.componentIsActive = true
  }

  deleteAppointment(appointmentId:number){

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
            this.cs.delete('/appointments', `${appointmentId}`)
              .subscribe((response)=>{
                this.fs.registerNow("Rendez-vous supprimé", 'success')
                this.loadCorrespondent()
              })
          }
        }
      ]
    }).then((alert)=>{
      alert.present()
    })
  }

  environment = environment
}
