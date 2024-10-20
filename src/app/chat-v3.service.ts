import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import IMessage from './models/IMessages';
import { BroadcastingService } from './broadcasting.service';
import { ContentService } from './content.service';
import MessageSubject from './utils/MessageSubject';

@Injectable({
  providedIn: 'root'
})
export class ChatV3Service {

  constructor(
    private cs: ContentService,
    private bs: BroadcastingService
  ) { }

  async loadMessages(self_id: string, correspondent_id: string, date_offset: Date = new Date()){
    let output = new MessageSubject([])
    // Step 1. Check if the requested resources is in cache
    // -> fire a value to the output

    
    // Step 2. Register chat events
    let pusherSubscription = this.bs.pusher.subscribe(this.channelId(self_id))
    pusherSubscription
      .bind(this.eventId(correspondent_id), async({data, metainfo}) => {
        data = data.map((message:IMessage) => {
          return {
            ...message,
            created_at: new Date(message.created_at),
            updated_at: new Date(message.updated_at)
          }
        })
        // -> fire a value to the output
        output.next(data)

        // UPDATE THE CACHE
        let cached_data = (await this.cs.storage.get(this.cacheSlug(self_id, correspondent_id))) ?? []
        if(!(cached_data instanceof Array)) cached_data = []
        let merged_data = [...data, ...cached_data]
        let ids = new Set()
        merged_data = merged_data.filter((message:IMessage) => {
          if(ids.has(message.id)) return false
          ids.add(message.id)
          return true
        })
        merged_data.sort((a, b) => {
          return b.created_at.getTime() - a.created_at.getTime()
        })
        await this.cs.storage.set(this.cacheSlug(self_id, correspondent_id), merged_data)
      })
    
      

    // Step X. Check if the cache is available (to be encapsulated in a function)
    
    // Trigger the cached data by using pusher
    /**/
    //


    // Step 4. Update the cache
    console.log('Channel-id:', this.channelId(self_id))
    console.log('Event-id:', this.eventId(correspondent_id));

    // Step 5. Fire initial value to the output
    (async ()=>{
      await (new Promise(resolve => setTimeout(resolve, 100)));

      this.fireCachedData(self_id, correspondent_id, date_offset)
      await this.requestUpdate(self_id, correspondent_id, date_offset);
  
      (output as any).subscription = pusherSubscription // unused, TO BE DELETED LATER
    })()
    return output
  }

  async loadMoreMessages(self_id: string, correspondent_id: string, date_offset: Date = new Date(), callback: any = null){

    this.fireCachedData(self_id, correspondent_id, date_offset)
    await this.requestUpdate(self_id, correspondent_id, date_offset, callback);
  }

  async fireCachedData(self_id, correspondent_id, date_offset){
    let cached_data = (await this.cs.storage.get(this.cacheSlug(self_id, correspondent_id))) ?? []
    // which item have the date_offset
    let date_offset_index = -1
    for(let i=0; i < cached_data.length; i++){
      if(cached_data[i].created_at < date_offset){
        date_offset_index = i
        break
      }
    }
    if (date_offset_index + 10 <= cached_data.length){
      let cache_slice = cached_data.slice(date_offset_index, date_offset_index + 10)
      console.log("Fire cached data: ", cache_slice)
      // Fire cache data
      this.bs.pusher.channels.channels[this.channelId(self_id)].emit(this.eventId(correspondent_id), {
        data: cache_slice,
        metainfo: {}
      })
    }
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

  async clearCache(self_id, correspondent_id){
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
