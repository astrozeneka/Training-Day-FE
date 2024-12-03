import { Injectable } from '@angular/core';
import { ContentService } from './content.service';
import { User } from './models/Interfaces';
import StoredData from './components-submodules/stored-data/StoredData';
import { BehaviorSubject, catchError, filter, merge, Observable } from 'rxjs';
import { BroadcastingService } from './broadcasting.service';
import IMessage from './models/IMessages';
import { Storage } from '@ionic/storage-angular';

export class StoredMessages extends StoredData<IMessage[]> {
  constructor(key: string, storage: Storage) {
    super(key, storage);
  }

  public override async set(newValue: IMessage[]): Promise<void> {
    return new Promise(async(resolve, reject) => {
      let allData = await this.get()
      if (allData instanceof Array){
        //let toBeSet = [...allData, ...newValue]
        //console.log("ToBeSet", toBeSet)
        let toBeSet = [...allData]
        for (let msg of newValue){
          // If included, then replace
          if (toBeSet.findIndex((m:IMessage)=>m.id==msg.id) != -1){
            toBeSet = toBeSet.map((m:IMessage)=>{
              if (m.id == msg.id) return msg
              return m
            })
          }
          // If not included, then add
          else{
            toBeSet.push(msg)
          }
        }
        // Sort by created_at
        toBeSet.sort((a, b) => {
          return (b.created_at as Date).getTime() - (a.created_at as Date).getTime()
        })
        // Cleanse the data by removing duplicates (byId)
        let cleansedToBeSet = []
        for(let msg of toBeSet){
          if (cleansedToBeSet.findIndex((m:IMessage)=>m.id==msg.id) == -1){
            cleansedToBeSet.push(msg)
          }
        }
        await super.set(cleansedToBeSet)
      } else {
        await super.set(newValue)
      }
    })
  }

  public async getByOffset(offset: Date): Promise<IMessage[]> {
    return new Promise(async (resolve, reject) => {
      let allData:IMessage[] = await super.get()
      resolve(allData)
    })
  }
}

type CacheSlug = string

@Injectable({
  providedIn: 'root'
})
export class ChatV4Service {
  usersByIdData: {[key: number]: StoredData<User>} = {};
  usersByIdSubject: {[key: number]: BehaviorSubject<User>} = {};
  usersById$: {[key: number]: Observable<User>} = {};

  messagesData: {[key: CacheSlug]: StoredMessages} = {}
  messagesSubject: {[key: CacheSlug]: BehaviorSubject<IMessage[]>} = {}
  messages$: {[key: CacheSlug]: Observable<IMessage[]>} = {}
  
  constructor(
    private cs: ContentService,
    private bs: BroadcastingService
  ) { }

  /**
   * Load user data by id
   */
  onUserByIdData(id: number, fromCache: boolean, fromServer: boolean) {
    let additionalEventsSubject = new BehaviorSubject<User>(null);
    let additionalEvents$ = additionalEventsSubject.asObservable();

    // Initialization
    if (!this.usersByIdData[id]){
      this.usersByIdData[id] = new StoredData<User>(`user${id}`, this.cs.storage);
      this.usersByIdSubject[id] = new BehaviorSubject<User>(null);
      this.usersById$[id] = this.usersByIdSubject[id].asObservable();
    }

    // 1. Fire the cached data (if exists)
    if (fromCache) {
      this.usersByIdData[id].get().then((user: User)=>{
        additionalEventsSubject.next(user);
      })
    }

    // 2. Fire from the server
    if (fromServer) {
      this.cs.getOne(`/users/${id}`, {})
        .pipe(catchError(err=>{
          additionalEventsSubject.error(err); // What does it mean
          return err;
        }))
        .subscribe((user: User)=>{
          additionalEventsSubject.next(user);
          this.usersByIdData[id].set(user);
        })
    }

    let output$ = merge(this.usersById$[id], additionalEvents$);
    output$ = output$.pipe(filter((data)=>data!=null))
    return output$
  }

  onMessages(userId: number, correspondentId: number, offset: Date, fromCache: boolean, fromServer: boolean) {
    let outputSubject:BehaviorSubject<IMessage[]> = new BehaviorSubject<IMessage[]>([]);
    let output$:Observable<IMessage[]> = outputSubject.asObservable();

    if (!this.messagesData[this.cacheSlug(userId, correspondentId)]) {
      // this.messagesData.set([userId, correspondentId], new StoredMessages(this.cacheSlug(userId, correspondentId), this.cs.storage));
      this.messagesData[this.cacheSlug(userId, correspondentId)] =
        new StoredMessages(this.cacheSlug(userId, correspondentId), this.cs.storage)
    }

    // Load data from cache
    if (fromCache) {
      this.messagesData[this.cacheSlug(userId, correspondentId)].getByOffset(offset)
        .then((data:IMessage[])=>{
          console.log("Here")
          console.log(data)
          outputSubject.next(data)
        })
    }

    // Special events from pusher
    if (fromServer) {
      this.bs.pusher.subscribe(this.channelId(userId)).bind(this.eventId(correspondentId), async({data, metainfo})=>{
        data = data.map((m:IMessage) => {return {
          ...m,
          created_at: new Date(m.created_at),
          updated_at: new Date(m.updated_at)
        }})
        // Fire output
        outputSubject.next(data);
        // Update Cache
        this.messagesData[this.cacheSlug(userId, correspondentId)].set(data)
      });
    }

    // Step 5. Fire initial value to the output
    this.requestUpdate(userId, correspondentId, offset);

    return output$
  }

  async requestUpdate(self_id, correspondent_id, date_offset, callback=null){
    return new Promise((resolve) => {
      this.cs.post(`/messages/request-update/${correspondent_id}`, {
        date_offset: date_offset,
        senderId: self_id
      }).subscribe(res => {
        callback?.() // I don't know what is this for
        resolve(res)
      });
    })
  }

  async triggerLoadMore(userId: number, correspondentId: number, offset:Date){

  }

  async clearCache(self_id, correspondent_id){
    // Seems not to work
    await this.cs.storage.remove(this.cacheSlug(self_id, correspondent_id))
  }

  channelId(self_id){
    return `messages.${self_id}`
  }

  eventId(correspondent_id){
    return `message.${correspondent_id}`
  }

  cacheSlug(self_id, correspondent_id){
    return `messages.${self_id}.${correspondent_id}`
  }
}
