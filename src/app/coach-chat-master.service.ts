import { Injectable } from '@angular/core';
import StoredData from './components-submodules/stored-data/StoredData';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { BroadcastingService } from './broadcasting.service';
import { ContentService } from './content.service';
import { Discussion } from './models/Interfaces';
import { Storage } from '@ionic/storage-angular';
import IMessage from './models/IMessages';

export type coachTabOption = 'coach'|'nutritionist'

export class StoredDiscussions extends StoredData<Discussion[]> {
  constructor(key: string, storage: Storage) {
    super(key, storage);
  }

  // I think no need to customize
}

@Injectable({
  providedIn: 'root'
})
export class CoachChatMasterService {

  activeTabData: StoredData<coachTabOption>
  // activeTabSubject = new BehaviorSubject<coachTabOption>('coach')
  // activeTab$ = this.activeTabSubject.asObservable()

  discussionsData: {[key: number]: StoredDiscussions} = {} // Indexed by userId
  discussionsSubject: {[key: number]: BehaviorSubject<Discussion[]>} = {} // Indexed by userId
  discussions$: {[key: number]: Observable<Discussion[]>} = {} // Indexed by userId

  constructor(
    private cs: ContentService,
    private bs: BroadcastingService
  ) { 
    this.activeTabData = new StoredData<coachTabOption>('activeTab', this.cs.storage)
  }

  /**
   * Used to store the currently activated tab in the swipeable content
   */
  onActiveTab(){
    let output$ = new Subject<coachTabOption>()
    this.activeTabData.get().then((data:coachTabOption)=>{
      output$.next(data)
    })
    return output$
  }

  onDiscussions(userId: number, fromCache: boolean, fromServer: boolean){
    if (!this.discussionsData[userId]){
      this.discussionsData[userId] = new StoredDiscussions(`discussions-${userId}`, this.cs.storage)
      this.discussionsSubject[userId] = new BehaviorSubject<Discussion[]>([])
      this.discussions$[userId] = this.discussionsSubject[userId].asObservable()
    }
    let outputSubject = this.discussionsSubject[userId]
    let output$ = this.discussions$[userId]

    // The new way to listen to pusher (similar to chat-v4)
    // aster-updated doesn't work actually, but we need to bind_global, then listen
    let channel = this.bs.pusher.subscribe(this._channelId(userId))
    channel.bind(this._eventId(), ({data, metainfo})=>{
      console.log("Receive data from pusher", data)
      // ======
      // Data preparation can be done here (see chat-v4)
      // ======
      if(typeof data == "object") // Here data is an object, but should be array (This is from the way localStorage stores items)
        data = Object.values(data)
      for(let i = 0; i < data.length; i++){
        let url = data[i].thumbnail64 || data[i].profile_image?.permalink
        data[i].avatar_url = url ? this.cs.addPrefix(url) : undefined
      }
      data = data.filter((item:any)=>item.id != userId) // Cannot Chat himself
      data = data.sort((a, b)=>{ // Filter and sort
        let dateA = a.messages.length > 0 ? Date.parse(a.messages[0].created_at) : 0
        let dateB = b.messages.length > 0 ? Date.parse(b.messages[0].created_at) : 0
        return dateB - dateA
      })

      outputSubject.next(data)
      // Update cache storage
      this.discussionsData[userId].set(data)
    })

    // (experimental) For real time notification
    channel.bind_global((event:string, c)=>{
      // The code below is not used to update data for coach interface
      console.log("Receive data from pusher", event, c)
      let data = c.data
      // If the pattern message.33 is followed
      if (event.startsWith('message.') && !Number.isNaN(parseInt(event.split('.')[1]))){
        let messages:IMessage[] = data
        let correspondent_id = parseInt(event.split('.')[1])
        if (messages.length > 1) return; // We except that only a single message is fired, a multiple message in one shot is for message-detail loading
        // Patch the already existing data
        this.discussionsData[userId].get().then((discussions:Discussion[])=>{
          let updatedIndex = discussions.findIndex((item)=>item.id == correspondent_id)
          // Sort by created_at (latest first)
          messages = messages.sort((a, b)=>Date.parse(b.created_at as string) - Date.parse(a.created_at as string))
          let lastMessage = messages[0]
          // Replace the last message of the discussion
          discussions[updatedIndex].messages = [lastMessage]
          // Increment the unread count
          console.log("Here, increment", data)
          if (lastMessage.sender_id != userId)
            discussions[updatedIndex].unread++
          // Sort
          discussions = discussions.sort((a, b)=>{
            let dateA = a.messages.length > 0 ? Date.parse(a.messages[0].created_at as string) : 0
            let dateB = b.messages.length > 0 ? Date.parse(b.messages[0].created_at as string) : 0
            return dateB - dateA
          })
          outputSubject.next(discussions)
          // update cache storage
          this.discussionsData[userId].set(discussions)
        })
      }
    })

    if (fromCache){
      this.discussionsData[userId].get().then((data:Discussion[])=>{
        outputSubject.next(data)
      })
    }

    if (fromServer){
      this._requestUpdate(userId)
    }

    return output$
  }

  private _requestUpdate(userId:number){
    // This bunch of code is not called by the coach master
    setTimeout(()=>{
      console.log("Requesting for update")
      this.cs.post(`/chat/request-update/${userId}`, {})
        .subscribe(data => null)
    }, 2000) // Wait for 1 second
  }

  private _channelId(userId){
    return `messages.${userId}`
  }

  private _eventId(){
    return 'master-updated'
  }

  /**
   * Reset unread count
   */
  public resetBadgeForCorrespondent(self_id:number, correspondent_id:number){
    this.discussionsData[self_id].get().then((data:Discussion[])=>{
      let updatedIndex = data.findIndex((item)=>item.id == correspondent_id)
      data[updatedIndex].unread = 0
      this.discussionsSubject[self_id].next(data)
      this.discussionsData[self_id].set(data)
    })
  }
}
