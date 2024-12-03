import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, forkJoin, tap, throwError } from 'rxjs';
import { ChatV4Service } from 'src/app/chat-v4.service';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { isEqual } from 'lodash';
import IMessage from 'src/app/models/IMessages';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
const distinctUntilObjectChanged = distinctUntilChanged((a, b) => isEqual(a, b))

interface IFile {
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
    this.cv4s.triggerLoadMore(this.user.id, this.correspondent.id, this.offset, true, true)
      .then((_:void)=>{
        event?.target.complete()
      })
  }

  constructor(
    private cs: ContentService,
    private cv4s: ChatV4Service,
    private route: ActivatedRoute,
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
          this.user = user as User;
          this.correspondent = correspondent as UserWithAvatar;
          this._initializeMessages(); 

          // Prepare correspondent avatar (same as the old codebase)
          let url = correspondent.thumbnail64 || correspondent.profile_image?.permalink
          this.correspondent.avatar_url = url ? `${environment.rootEndpoint}/storage/${url}` : '/assets/samples/profile-sample-1.jpg'
        })
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
        console.log(messages)
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
      console.log(this.offset)
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
    // Todo, validation


    // The code below (except symbols) are the same as from old version
    /*let obj:any = this.form.value;
    obj.recipient_id = this.correspondent.id;
    obj.sender_id = (await this.cs.storage.get('user')).id*/
    let payload = {
      ...this.form.value,
      recipient_id: this.correspondent.id,
      sender_id: this.user.id
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
      .subscribe((res)=>{
        // TODO, upload progress
      });
    
    // Temporarily append the message to the list for better UX
    (payload as any).undelivered = true
    this.messageList.unshift(payload as IMessage)
  }

  public async presentMessageActionSheet(messageId: number) {
    // Todo
  }
}
