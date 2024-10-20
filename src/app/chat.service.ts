import { Injectable, OnInit } from '@angular/core';
import { ContentService } from './content.service';
import { BroadcastingService } from './broadcasting.service';
import { da } from 'date-fns/locale';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  user = undefined

  // The unread messages number
  unreadMessagesSubject = new Subject<number>()
  unreadMessages$ = this.unreadMessagesSubject.asObservable()

  constructor(
    private cs: ContentService,
    private bs: BroadcastingService
  ) { 
    this.cs.userStorageObservable.getStorageObservable().subscribe(async (user) => {
      this.user = user
    })
  }

  async loadMessages(correspondent_id, offset=0, callback, coachAsNutritionist=false){
    /* This will do same as post('/messages/request-update/id')
       but it will use web storage to use cache for better UX */
    
    let user_id = coachAsNutritionist ? environment.nutritionistId : this.user.id
    
    // Data cache code will be added here below
    let cache_slug = `messages.${user_id}.${correspondent_id}.${offset}`
    let cached_data = await this.cs.storage.get(cache_slug)
    if (cached_data && cached_data.expires_at > Date.now() && false) { // Disable cache temporarily
      this.cs.storage.set(cache_slug, {
        data: cached_data.data,
        expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
      })
      console.log(coachAsNutritionist)
      console.log("Load data from cache " + cache_slug + "", cached_data)
      callback(cached_data.data)
      return
    }
    this.cs.post(`/messages/request-update/${correspondent_id}`, {
      offset: offset,
      ... coachAsNutritionist?{senderId:environment.nutritionistId}:{}
    })
      .subscribe(res => null)
  }

  async updateCache(rows, correspondent_id){
    let all_messages = []
    console.log("Ask to update the cache: ", rows)
    let keys = (await this.cs.storage.keys()).filter((key)=>key.startsWith(`messages.${this.user.id}.${correspondent_id}.`))
    for (const key of keys) {
      let _data = await this.cs.storage.get(key)
      if (_data.expires_at < Date.now()) continue
      all_messages = all_messages.concat(_data.data.data)
    }
    // Add the new rows
    all_messages = all_messages.concat(rows)
    // Sort as all message having '[deleted]' as content will be on top
    all_messages = all_messages.sort((a, b) => {
      if (a.content == '[deleted]') return -1
      if (b.content == '[deleted]') return 1
      return 0
    })
    // Filter undefined
    all_messages = all_messages.filter((row)=>row)
    // Sort by 'created at'
    all_messages = all_messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    //console.log(`All messages (${all_messages.length})`, all_messages)
    // Filter by unique id
    let unique = {}
    all_messages = all_messages.filter((row)=>{
      if (unique[row.id]){
        return false
      }
      unique[row.id] = true
      return true
    })
    console.log(`All messages (${all_messages.length})`, all_messages)
    // Update the cache
    for (const key of keys) {
      let offset = parseInt(key.split('.').pop())
      let _newData = all_messages.slice(offset, offset + 10)
      if (_newData.length == 0) continue
      /*console.log(`Update cache (${key}) with new data: `, {
        data: _newData,
        expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
      })*/
      await this.cs.storage.set(key, {
        data: {
          data: _newData,
          metainfo: null
        },
        expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
      })
    }
  }

  registerChatEvents(correspondent_id, callback, coachAsNutritionist=false) {
    let pusher_id = `messages.${this.user.id}`
    if(coachAsNutritionist)
      pusher_id = `messages.${environment.nutritionistId}` 
    console.log("Pusher id: ", pusher_id)
    console.log("Subscribe to: ", `message-details-updated-${correspondent_id}`)
    let subscription = this.bs.pusher.subscribe(pusher_id)
      .bind(`message-details-updated-${correspondent_id}`, async ({data, metainfo}) => {
        console.log("Load data from broadcasting: "/*, {data, metainfo}*/)
        // Store into cache
        let recipientId = coachAsNutritionist ? environment.nutritionistId : this.user.id
        let cache_slug = `messages.${recipientId}.${correspondent_id}.${metainfo.offset}`
        if (!metainfo.alter_cache){
          console.log("Store cached data ("+cache_slug+"): "/*, {
            data: {data, metainfo},
            expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
          }*/)
          await this.cs.storage.set(cache_slug, {
            data: {data, metainfo},
            expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
          })
        }else{
          this.updateCache(data, correspondent_id) // This should be placed above
          // And all code above should be deleted or idk
        }
        callback({data, metainfo})
      })
    //await new Promise((resolve)=>setTimeout(resolve, 1000))
    this.loadMessages(correspondent_id, 0, callback, coachAsNutritionist) // offset is 0
    return subscription
  }

  async clearCache(correspondent_id){
    let keys = (await this.cs.storage.keys()).filter((key)=>key.startsWith(`messages.${this.user.id}.${correspondent_id}.`))
    for (const key of keys) {
      await this.cs.storage.remove(key)
    }
  } 

}
