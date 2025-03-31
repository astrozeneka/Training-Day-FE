import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, merge, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BottomNavbarUtilsService {
  bottomNavbarAvailable: boolean = true // Hidden by default

  tabSequences = ['home', 'tools', 'videos', 'recipe-home', 'profile']

  tabMatches = {
    'home': ['home', '/'],
    'tools': ['tools', 'app-gps', 'app-timer', 'app-imc', 'app-calories', 'app-weight-tracking'], 
    'video-home': ['video-home', 'video-submenu', 'videos'], 
    'recipe-home': ['recipe-home', 'recipe-by-category', 'recipe-details'], 
    'profile': ['profile'],
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
        console.log("Handle", e)
        e = (e as any).url
        if (flattenedMatches.includes(e.split('/')[1])){
          this.bottomNavbarAvailable = true
        } else {
          this.bottomNavbarAvailable = false
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
}
