import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Storage} from "@ionic/storage-angular";
import {catchError, forkJoin, of, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  apiEndpoint = 'http://localhost:8000/api'
  isDebug = true

  bearerHeaders(): any{
    const options:any = {}
    if(this.storage.get('token') != undefined){
      options['Authorization'] = `Bearer ${this.storage.get('token')}`
    }
  }

  constructor(
    private httpClient: HttpClient,
    public storage: Storage
  ) {
    this.storage.create()
  }

  post(suffix:string, data:any){
    // TODO: should have the bearer
    let headers = this.bearerHeaders()
    return this.httpClient.post(`${this.apiEndpoint}${suffix}?${this.isDebug?'XDEBUG_SESSION_START=client':''}`, data, {headers})
  }

  get(suffix:string, offset=0){
    let headers = this.bearerHeaders()
    let dataObs = this.httpClient.get(`${this.apiEndpoint}${suffix}?offset=${offset}&${this.isDebug?'XDEBUG_SESSION_START=client':''}`, {headers})
    let metainfoObs = this.httpClient.get(`${this.apiEndpoint}${suffix}/metaInfo?${this.isDebug?'XDEBUG_SESSION_START=client':''}`)
    metainfoObs.pipe(
      catchError((error:any)=>{
        if(error.status == 404){
          return of(null)
        }
        return throwError(()=>error)
      })
    )
    return forkJoin([dataObs, metainfoObs])
  }
}
