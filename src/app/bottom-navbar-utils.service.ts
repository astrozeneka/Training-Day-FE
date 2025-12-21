
import { ChangeDetectorRef, Injectable, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, merge, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BottomNavbarUtilsService {
  
  /* @deprecated use isNavbarVisible() instead */
  bottomNavbarAvailable: boolean = true // Hidden by default

  isNavbarVisible: WritableSignal<boolean> = signal(true)

  tabSequences = ['home', 'tools', 'videos', 'recipe-home', 'profile']

  tabMatches = {
    'home': ['home', '', 'swipeable-store'],
    'tools': ['tools', 'app-gps', 'app-timer', 'app-imc', 'app-calories', 'app-weight-tracking'], 
    'video-home': ['video-home', 'video-submenu', 'videos'], 
    'recipe-home': ['recipe-home', 'recipe-by-category', 'recipe-details'], 
    'profile': ['profile'],
    '': ['messenger-master', 'exercise-categories', 'exercise-list']
  }
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    let flattenedMatches = Object.values(this.tabMatches).reduce((acc, val) => acc.concat(val), []);
    merge(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd)),
      of({url: this.router.url})
    )
      .subscribe((e:any)=>{
        e = (e as any).url
        console.log("e", e)
        if (flattenedMatches.includes(e.split('/')[1].split("?")[0])) {
          this.bottomNavbarAvailable = true
          this.isNavbarVisible.set(true)
        } else {
          this.bottomNavbarAvailable = false
          this.isNavbarVisible.set(false)
        }
      })
  }

  getActivatedTabName(routeUrl:string): string{
    let slug = routeUrl.split('/')[1]
    let tabName = Object.keys(this.tabMatches).find((key) => this.tabMatches[key].includes(slug))
    if (tabName)
      return tabName
    return undefined
  }

  setVisibility(visible: boolean) {
    this.bottomNavbarAvailable = visible
    this.isNavbarVisible.set(visible)
  }
}
