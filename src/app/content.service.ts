import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Storage} from "@ionic/storage-angular";

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  apiEndpoint = 'http://localhost:8000/api'

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
    return this.httpClient.post(`${this.apiEndpoint}${suffix}`, data, {headers})
  }
}
