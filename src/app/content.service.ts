import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Storage} from "@ionic/storage-angular";
import {catchError, forkJoin, from, map, mergeMap, Observable, of, throwError} from "rxjs";
import {ActivatedRoute, Route, Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  apiEndpoint = 'http://localhost:8000/api'
  isDebug = true

  private _token = null;
  bearerHeaders(){
    const options:any = {}
    options['Authorization'] = `Bearer ${this._token}`;
    return options
  }

  async reloadHeader() {
    let token = await this.storage.get('token')
    if(token != undefined){
      this._token = token
    }
  }

  requestLogin(data:any) {
    let headers = this.bearerHeaders()
    let debugParams = this.isDebug?'?XDEBUG_SESSION_START=client':''
    return this.httpClient.post(`${this.apiEndpoint}/request-login${debugParams}`, data, {})
      .pipe(
        map(async (res:any)=>{
          if(res.token)
            await this.storage.set('token', res.token)
          if(res.user)
            await this.storage.set('user', res.user)
          console.log(res.token)
          console.log(res.user)
        }),
        mergeMap((res: any)=>from(res))
      )
  }

  constructor(
    private httpClient: HttpClient,
    public storage: Storage,
    public route: ActivatedRoute,
    public router: Router
  ) {
    this.storage.create()
    this.storage.get('token').then((e)=>{
      if(e != undefined){

      }
    })
    this.router.events.subscribe((res)=>{
      this.reloadHeader()
    })
  }

  post(suffix:string, data:any){
    // TODO: should have the bearer
    let headers = this.bearerHeaders()
    return this.httpClient.post(`${this.apiEndpoint}${suffix}?${this.isDebug?'XDEBUG_SESSION_START=client':''}`, data, {headers})
  }

  get(suffix:string, offset=0, searchValue="", searchFilter="", limit=10){
    let headers = this.bearerHeaders()

    return new Observable<[any, any]>(observer => {
      this.storage.get('token')
        .then(token => {
          const headers:any = {}
          headers['Authorization'] = `Bearer ${token}`;
          let searchParams = searchValue!=""?`${searchFilter}=${searchValue}`:""
          let debugParams = this.isDebug?'&XDEBUG_SESSION_START=client':''
          let limitParams = limit?`&limit=${limit}`:''
          let dataObs:Observable<any> = this.httpClient.get(`${this.apiEndpoint}${suffix}?offset=${offset}&${searchParams}${debugParams}${limitParams}`, {headers})
          let metainfoObs:Observable<any> = this.httpClient.get(`${this.apiEndpoint}${suffix}/metaInfo?${searchParams}${debugParams}`, {headers})
          metainfoObs.pipe(
            catchError((error:any)=>{
              if(error.status == 404){
                return of(null)
              }
              return throwError(()=>error)
            })
          )
          forkJoin([dataObs, metainfoObs]).subscribe({
            next: ([data, metaInfo]) => {
              observer.next([data, metaInfo]);
            },
            error: (error) => {
              // Handle errors here or pass them to the observer
              observer.error(error);
            },
            complete: () => {
              observer.complete();
            }
          });
        })
    })
    /*
    return this.storage.get('token')
      .then((token)=>{


        let dataObs = this.httpClient.get(`${this.apiEndpoint}${suffix}?offset=${offset}&${searchParams}${debugParams}${limitParams}`, {headers})
        let metainfoObs = this.httpClient.get(`${this.apiEndpoint}${suffix}/metaInfo?${searchParams}${debugParams}`, {headers})
        metainfoObs.pipe(
          catchError((error:any)=>{
            if(error.status == 404){
              return of(null)
            }
            return throwError(()=>error)
          })
        )
        return forkJoin([dataObs, metainfoObs])
      })
    /*
    let searchParams = searchValue!=""?`${searchFilter}=${searchValue}`:""
    let debugParams = this.isDebug?'&XDEBUG_SESSION_START=client':''
    let limitParams = limit?`&limit=${limit}`:''
    let dataObs = this.httpClient.get(`${this.apiEndpoint}${suffix}?offset=${offset}&${searchParams}${debugParams}${limitParams}`, {headers})
    let metainfoObs = this.httpClient.get(`${this.apiEndpoint}${suffix}/metaInfo?${searchParams}${debugParams}`, {headers})
    metainfoObs.pipe(
      catchError((error:any)=>{
        if(error.status == 404){
          return of(null)
        }
        return throwError(()=>error)
      })
    )
    return forkJoin([dataObs, metainfoObs])
    */
  }

  getOne(suffix:string, criterias:any){
    let headers = this.bearerHeaders()
    let criteriaParams = ""
    for (const key in criterias)
      if (criterias.hasOwnProperty(key)) {
        if (criteriaParams !== '')
          criteriaParams += '&';
        criteriaParams += `${encodeURIComponent(key)}=${encodeURIComponent(criterias[key])}`;
      }
    let debugParams = this.isDebug?'&XDEBUG_SESSION_START=client':''
    return this.httpClient.get(`${this.apiEndpoint}${suffix}?${criteriaParams}${debugParams}`, {headers})
  }

  put(suffix:string, data:any){
    let headers = this.bearerHeaders()
    return this.httpClient.put(`${this.apiEndpoint}${suffix}?${this.isDebug?'XDEBUG_SESSION_START=client':''}`, data, {headers})
  }

  delete(suffix: string, idList: string){
    let headers = this.bearerHeaders()
    let idListParams = `id_list=${idList}`
    let debugParams = this.isDebug?'XDEBUG_SESSION_START=client':''
    return this.httpClient.delete(`${this.apiEndpoint}${suffix}?${idListParams}&${debugParams}`, {headers})
  }
}
