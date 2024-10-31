import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {environment} from "../../../environments/environment";
import { debounce, debounceTime, filter, first, last } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrls: ['./videos.page.scss'],
})
export class VideosPage implements OnInit {
  user = undefined
  title = '';
  category = undefined
  videos:any = []
  videoLoading = false
  jwtToken = undefined

  // The filter used for loading videos
  filterSubject = new BehaviorSubject<any>(undefined) // Undefined is different from empty object
  filter$ = this.filterSubject.asObservable()

  // The slug fetched from the url
  slug:string = undefined // unused

  // The below code should be put in a separate folder, not here
  slugDescriptions = {
    'training': 'Découvrez les vidéos sur les entrainements',
    'boxing': 'Découvrez les vidéos sur les boxes',
    'training/corps-entier': 'Découvrez les vidéos d\'entraînement sur le corps entier',
    'training/bras': 'Découvrez les vidéos d\'entraînement sur les bras et les épaules',
    'training/abdos': 'Découvrez les vidéos d\'entraînement sur les abdos',
    'training/jambes': 'Découvrez les vidéos d\'entraînement sur les jambes',
    'training/fessiers': 'Découvrez les vidéos d\'entraînement sur les fessiers',
    'training/pectoraux': 'Découvrez les vidéos d\'entraînement sur les pectoraux',
    'training/dos': 'Découvrez les vidéos d\'entraînement sur le dos',
    
    'boxing/base': 'Découvrez les vidéos sur les bases de la boxe',
    'boxing/poings': 'Découvrez les vidéos sur les poings',
    'boxing/pieds-genoux': 'Découvrez les vidéos sur les pieds et les genoux',
    'boxing/pieds-poings-genoux': 'Découvrez les vidéos sur les pieds, les poings et les genoux',
  }

  // Improve UX by adding a video spinner while loading the video
  isLoading = true

  constructor(
    private router: Router,
    protected contentService: ContentService,
    protected cdr: ChangeDetectorRef
  ) {
    // OLD cde, delete later
    /*console.log("Subscribe video loading")
    let subscription = router.events.subscribe((event) => { // Not optimized for performance
      if(event instanceof NavigationEnd && event.url.includes('/videos/training')){
        this.title = "Découvrez les vidéos sur les entrainements"
        this.category = 'training'
        this.loadVideoList()
      }
      if(event instanceof NavigationEnd && event.url.includes('/videos/boxing')){
        this.title = "Découvrez les vidéos sur les boxes"
        this.category = 'boxing'
        this.loadVideoList()
      }
      if(event instanceof NavigationStart){
        console.log("Unsubscribe video loading")
        subscription.unsubscribe()
      }
    })*/
  }

  async ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event:NavigationEnd) => (this.category === undefined || this.category === event.url.split('/').slice(2).join('/'))),
      )
      .subscribe((event:NavigationEnd) => {
        this.category = event.url.split('/').slice(2).join('/') ?? ''
        this.title = this.slugDescriptions[this.category]
        console.log("Here")
        this.filterSubject.next({'f_category': this.category})
        //this.filterSubject.next(this.category != '' ? {'f_category': this.category} : {})
      })
    
    this.jwtToken = await this.contentService.storage.get('token')

    /*
    if (event.url.includes('/videos/training')){
      this.title = "Découvrez les vidéos sur les entrainements"
      this.category = 'training'
    } else if(event.url.includes('/videos/boxing')){
      this.title = "Découvrez les vidéos sur les boxes"
      this.category = 'boxing'
    }
    */

    this.contentService.userStorageObservable.getStorageObservable().subscribe((res)=>{
      this.user = res
    })
  }

  async loadVideoList() {
    this.jwtToken = await this.contentService.storage.get('token') // Used by the child ion-infinite loader
    console.log(this.jwtToken)
    this.cdr.detectChanges()
    // Should fire event to update the video content
    /*
    if (this.videoLoading) return
    console.log("Loading videos")
    this.videoLoading = true
    this.contentService.getCollection(`/videos`, undefined, {'f_category': this.category}, 3).subscribe((res: any) => {
      this.videos = res.data as object
      setTimeout(() => {
        this.videoLoading = false
      }, 1000)
    })
     */
  }

  goToVideo(video_id:number){
    this.router.navigate(['/video-view/', video_id])
  }

  getUrl(suffix:string){
    return environment.rootEndpoint + '/' + suffix
  }

  onAfterLoad($event){
    this.isLoading = false
  }

}
