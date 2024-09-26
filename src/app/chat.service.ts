import { Injectable, OnInit } from '@angular/core';
import { ContentService } from './content.service';
import { BroadcastingService } from './broadcasting.service';
import { da } from 'date-fns/locale';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  user = undefined

  constructor(
    private cs: ContentService,
    private bs: BroadcastingService
  ) { 
    this.cs.userStorageObservable.getStorageObservable().subscribe(async (user) => {
      this.user = user
    })
  }

  async loadMessages(correspondent_id, offset=0, callback){
    /* This will do same as post('/messages/request-update/id')
       but it will use web storage to use cache for better UX */
      
    
    // Data cache code will be added here below
    let cache_slug = `messages.${this.user.id}.${correspondent_id}.${offset}`
    let cached_data = await this.cs.storage.get(cache_slug)
    if (cached_data && cached_data.expires_at > Date.now() && true) {
      this.cs.storage.set(cache_slug, {
        data: cached_data.data,
        expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
      })
      console.log("Load data from cache", cached_data)
      callback(cached_data.data)
      return
    }


    this.cs.post(`/messages/request-update/${correspondent_id}`, {
      offset: offset
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
    // Filter undefined
    all_messages = all_messages.filter((row)=>row)
    // Sort by 'created at'
    all_messages = all_messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    // Filter by unique id
    let unique = {}
    all_messages = all_messages.filter((row)=>{
      if (unique[row.id]){
        return false
      }
      unique[row.id] = true
      return true
    })

    console.log("All messages: ", all_messages)
    // Update the cache
    for (const key of keys) {
      let offset = parseInt(key.split('.').pop())
      let _newData = all_messages.slice(offset, offset + 10)
      if (_newData.length == 0) continue
      console.log("Update cache with new data: ", {
        data: _newData,
        expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
      })
      await this.cs.storage.set(key, {
        data: {
          data: _newData,
          metainfo: null
        },
        expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
      })
    }
  }

  async registerChatEvents(correspondent_id, callback) {
    this.bs.pusher.subscribe(`messages.${this.user.id}`)
      .bind(`message-details-updated-${correspondent_id}`, async ({data, metainfo}) => {
        console.log("Load data from broadcasting: ", {data, metainfo})
        // Store into cache
        let cache_slug = `messages.${this.user.id}.${correspondent_id}.${metainfo.offset}`
        if (!metainfo.alter_cache){
          console.log("Store cached data: ", {
            data: {data, metainfo},
            expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
          })
          await this.cs.storage.set(cache_slug, {
            data: {data, metainfo},
            expires_at: Date.now() + 1000 * 60 * 5 // 5 minutes
          })
        }else{
          this.updateCache(data, correspondent_id)
        }
        callback({data, metainfo})
      })
    
    await new Promise((resolve)=>setTimeout(resolve, 1000))
    this.loadMessages(correspondent_id, 0, callback) // offset is 0
  }

}
