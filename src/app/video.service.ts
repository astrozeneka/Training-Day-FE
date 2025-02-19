import { Injectable } from '@angular/core';
import StoredData from './components-submodules/stored-data/StoredData';
import { BehaviorSubject, filter, merge, Observable, Subject } from 'rxjs';
import { ContentService } from './content.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  videoListData: {[key:string]: StoredData<any[]>} = {}
  videoListSubject: {[key:string]: BehaviorSubject<any[]>} = {}
  videoList$: {[key:string]: Observable<any[]>} = {}

  videoDetailsData: {[key:number]: StoredData<any>} = {}
  videoDetailsSubject: {[key:number]: BehaviorSubject<any>} = {}
  videoDetails$: {[key:number]: any} = {}

  constructor(
    private cs: ContentService,
    private http: HttpClient
  ) { }

  /**
   * Load video list by category
   */
  onVideoList(category, fromCache=true, fromServer=true):Observable<any[]>{
    let additionalEvents$ = new Subject<any[]>()

    // Initialize keys if it doesn't exists
    if (!this.videoListData[category]){
      this.videoListData[category] = new StoredData<any[]>(`videos-${category}`, this.cs.storage)
      this.videoListSubject[category] = new BehaviorSubject<any[]>([])
      this.videoList$[category] = this.videoListSubject[category].asObservable().pipe(filter((data:any) => data?.length > 0))
    }

    // 1. Fire the cached data
    if (fromCache)
      this.videoListData[category].get().then((data:any[])=>{
        this.videoListSubject[category]
        this.videoListSubject[category].next(data)
      })
    
    // 2. Fire from the server
    if (fromServer){
      this.cs.getCollection(`/videos`, undefined, {'f_category': category}, 99999).subscribe((res) => {
        additionalEvents$.next(res.data)
        this.videoListData[category].set(res.data)
      })
    }

    // Prepare output
    let output$ = merge(this.videoList$[category], additionalEvents$)
    // output$ = output$.pipe(filter((data:any) => data?.length > 0)) // Filter empty data
    return output$
  }
}
