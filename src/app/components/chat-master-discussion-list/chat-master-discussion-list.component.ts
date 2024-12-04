import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, distinctUntilChanged, filter, from, merge, of, switchMap, tap } from 'rxjs';
import { BroadcastingService } from 'src/app/broadcasting.service';
import { ChatV4Service } from 'src/app/chat-v4.service';
import { CoachChatMasterService } from 'src/app/coach-chat-master.service';
import { ContentService } from 'src/app/content.service';
import { Discussion, User, UserSettings } from 'src/app/models/Interfaces';

@Component({
  selector: 'app-chat-master-discussion-list',
  templateUrl: './chat-master-discussion-list.component.html',
  styleUrls: ['./chat-master-discussion-list.component.scss'],
})
export class ChatMasterDiscussionListComponent  implements OnInit, OnChanges {

  @Input() userId: number
  user: User = null
  @Output() onUser = new EventEmitter<User>() // (experimental)
  isOnline:boolean = false

  // The discussion list to be displayed
  discussionList: Discussion[] = []
  displayedDiscussionList: Discussion[] = []

  // The search function
  searchControl = new FormControl<string>('')

  constructor(
    private cv4s: ChatV4Service,
    private bs: BroadcastingService,
    private cs: ContentService,
    private ccms: CoachChatMasterService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // 1. The user data
    let userLoaded$ = this.cv4s.onUserByIdData(this.userId, true, true)
      .pipe(tap((user)=>{
        this.user = user
        this.onUser.emit(user)

        // ====
        // If you want to apply this to the normal user, handle it from here
        // ====
    }))

    let discussionsLoaded$ = userLoaded$.pipe(distinctUntilChanged((a, b)=>a.id === b.id))
      .pipe(switchMap((user)=>{
        return this.ccms.onDiscussions(user.id, true, true)
          .pipe(filter(e=>e.length > 0))
      }))
      /*.subscribe((event)=>{
        this.ccms.onDiscussions(this.user.id, true, true)
          .pipe(filter(e=>e.length > 0)) // Can be deleted later  
          .subscribe((discussions)=>{
            console.log("Here ", this.user.id)
            this.discussionList = discussions
            this.cdr.detectChanges()
          })
        /*
        // Pusher listener
        console.log("Subscribe")
        this.bs.pusher.subscribe(this._channelId()).bind(this._eventId(), (data)=>{
          console.log(data)
        })
        this.cs.post(`/chat/request-update/${this.user.id}`, {})
          .subscribe(data => null)
        *//*
      })*/
    
    let searchValue$ = merge(this.searchControl.valueChanges, of(null))
    
    combineLatest([discussionsLoaded$, searchValue$])
      .subscribe(([discussions, query])=>{
        this.discussionList = discussions
        this.displayedDiscussionList = discussions.filter((discussion)=>{
          if (!query) return true
          let fullname = `${discussion.firstname} ${discussion.lastname}`
          let email = discussion.email
          return fullname.toLowerCase().includes(query.toLowerCase()) || email.toLowerCase().includes(query.toLowerCase())
        })
        this.cdr.detectChanges() // Might be deleted later
      })
    
    
  }

  private _computeOnlineStatus(){
    // Same code as in chat-master.page.ts
    let userSettings:UserSettings = this.user.user_settings || {} as any
    if(userSettings.activeFrom && userSettings.activeTo && userSettings.pauseDays){
        let activeFrom = userSettings.activeFrom // e.g. 08:00
        let activeTo = userSettings.activeTo // e.g. 18:00
        let pauseDays = userSettings.pauseDays // e.g. [0, 6] for Sunday and Saturday
        let now = new Date()

        // Check if the user is active
        let isPauseDay = pauseDays.includes(now.getDay())
        let [activeFromHour, activeFromMinute] = activeFrom.split(':').map(Number);
        let [activeToHour, activeToMinute] = activeTo.split(':').map(Number);
        let isInActiveTime = (now.getHours() > activeFromHour || (now.getHours() === activeFromHour && now.getMinutes() >= activeFromMinute)) &&
                             (now.getHours() < activeToHour || (now.getHours() === activeToHour && now.getMinutes() < activeToMinute));
        
        this.isOnline = !isPauseDay && isInActiveTime
    }
  }

  ngOnChanges() {}

  /**
   * @deprecated Pusher is now handled by coach-chat-master.service.ts
   */
  private _channelId(){
    return `messages.${this.user?.id ?? this.userId}`
  }

  /**
   * @deprecated Pusher is now handled by coach-chat-master.service.ts
   */
  private _eventId(){
    return 'master-updated'
  }

}
