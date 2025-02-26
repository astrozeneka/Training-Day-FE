import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BottomNavbarUtilsService {
  bottomNavbarAvailable: boolean = false // Hidden by default

  tabSequences = ['home', 'tools', 'videos', 'recipe-home', 'profile']
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { 
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e)=>{
        if (this.tabSequences.map(e => '/' + e === this.router.url).includes(true)) {
          this.bottomNavbarAvailable = true
        } else {
          this.bottomNavbarAvailable = false
        }
      })
  }
}
