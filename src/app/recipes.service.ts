import { Injectable } from '@angular/core';
import StoredData from './components-submodules/stored-data/StoredData';
import { BehaviorSubject, catchError, filter, map, merge, Observable, Subject, switchMap, throwError } from 'rxjs';
import { ContentService } from './content.service';
import { HttpClient } from '@angular/common/http';

export interface Recipe{
  id: number
  created_at: string
  updated_at: string
  title: string
  description: string
  category: string
  imageUrl: string
  docSmallPhoneUrl: string|null
  docLargePhoneUrl: string
  docTabletUrl: string|null

  // Base64 image
  docSmallPhoneBase64?: string
  docLargePhoneBase64?: string
  docTabletBase64?: string
}

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  cachingEnabled = true
  
  recipesData: StoredData<Recipe[]>
  recipesSubject: BehaviorSubject<Recipe[]>
  recipes$: Observable<Recipe[]>

  recipeDetailsData: {[key:number]: StoredData<Recipe>} = {}
  recipeDetailsSubject: {[key:number]: BehaviorSubject<Recipe>} = {}
  recipeDetails$: {[key:number]: Observable<Recipe>} = {}

  constructor(
    private cs: ContentService,
    private http: HttpClient
  ) { 
    this.recipesData = new StoredData<Recipe[]>('recipes', this.cs.storage)
    this.recipesSubject = new BehaviorSubject<Recipe[]>([])
    this.recipes$ = this.recipesSubject.asObservable()
  }

  /**
   * Load recipes from cache and server
   */
  onRecipesData(fromCache=true, fromServer=true):Observable<Recipe[]>{
    let additionalEvents$ = new Subject<Recipe[]>() // No need to use behavioral since the observable is subscribed before it fire data

    // 1. Fire the cahed data
    if (fromCache) {
      this.recipesData.get().then((data:Recipe[])=>{
        this.recipesSubject.next(data)
      })
    }
    
    // 2. Fire from the server
    if (fromServer){
      this.cs.getCollection('/recipes', 0, {}, 99999).subscribe(({data, metainfo}: any)=>{
        additionalEvents$.next(data)
        this.recipesData.set(data)
      })
    }
      
    // Prepare output
    let output$ = merge(this.recipes$, additionalEvents$)
    output$ = output$.pipe(filter((data)=>data?.length>0)) // Filter empty data
    return output$
  }

  /**
   * Load recipe detailed data
   * According to good pratice master/detail view might be different
   */
  onRecipeDetail(id, fromCache=true, fromServer=true):Observable<Recipe>{
    // if id not in the dict keys
    if (!this.recipeDetailsData[id]){
      this.recipeDetailsData[id] = new StoredData<Recipe>(`recipe-${id}`, this.cs.storage)
      this.recipeDetailsSubject[id] = new BehaviorSubject<Recipe>(null)
      this.recipeDetails$[id] = this.recipeDetailsSubject[id].asObservable()
    }

    let additionalEvents$ = new Subject<Recipe>() // No need to use behavioral since the observable is subscribed before it fire data

    // 1. Fire from the cache
    if (fromCache) {
      this.recipeDetailsData[id].get().then((data:Recipe)=>{
        this.recipeDetailsSubject[id].next(data)
      })
    }

    // 2. Fire from the server
    if (fromServer) {
      this.cs.getOne(`/recipes/${id}`, {})
      .pipe(
        catchError((err)=>{
          console.error(JSON.stringify(err))
          return throwError(()=>err)
        }),
        switchMap((data:Recipe)=>{
          if (this.cachingEnabled){
            // Load the image base64 in a cache
            // let observers = [] // Todo later ...
            let docLargePhoneBase64 = this.getbase64ImageFromUrl(data.docLargePhoneUrl)
            return new Observable((observer)=>{
              docLargePhoneBase64.subscribe((base64String)=>{
                data.docLargePhoneBase64 = base64String
                observer.next(data)
                observer.complete()
              })
            })
          } else {
            // Return only the data
            return new Observable((observer)=>{
              observer.next(data)
              observer.complete()
            })
          }
        })
      )
      .subscribe((data:Recipe)=>{
        // console.log(data)
        additionalEvents$.next(data)
        this.recipeDetailsData[id].set(data)
      })
    }

    // Prepare output
    let output$ = merge(this.recipeDetails$[id], additionalEvents$)
    output$ = output$.pipe(filter((data)=>data!=null)) // Filter empty data
    return output$
  }

  private getbase64ImageFromUrl(imageUrl: string) {
    // Compute mimeType by checking url extension
    let extension = imageUrl.split('.').pop()
    let mimeType
    if (extension === 'jpg' || extension === 'jpeg') {
      mimeType = 'image/jpeg'
    } else if (extension === 'png') {
      mimeType = 'image/png'
    } else if (extension === 'tif' || extension === 'tiff') {
      mimeType = 'image/tiff'
    }
    return this.http.get(imageUrl, { responseType: 'arraybuffer' })
      .pipe(
        catchError(e => {
          console.error(`Error while loading image from url ${imageUrl} - ${JSON.stringify(e)}`)
          return throwError(()=>e)
        }),
        map((arrayBuffer: ArrayBuffer) => {
          let binary = '';
          const bytes = new Uint8Array(arrayBuffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          // Convert binary string to base64 encoded string
          let base64String = window.btoa(binary);
          base64String = `data:${mimeType};base64,${base64String}`
          return base64String
        })
    )
  }
}
