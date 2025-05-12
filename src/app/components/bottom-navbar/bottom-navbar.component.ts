import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { filter, merge, of } from 'rxjs';
import { BottomNavbarUtilsService } from 'src/app/bottom-navbar-utils.service';
import { ContentService } from 'src/app/content.service';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.component.html',
  styleUrls: ['./bottom-navbar.component.scss'],
})
export class BottomNavbarComponent  implements OnInit {
  // Similar to as with 'Kakoo' but here, the fixedMode is default, no other behavior is implemented
  @Input() tabName: string|null = null // No need to add @Input

  // The right-most button shows different text depending on if the user is connected or not
  profileButtonText: string = "Se connecter"
  profileButtonDestination: string = "login"

  constructor(
    protected bnus: BottomNavbarUtilsService,
    public router: Router,
    public navController: NavController,
    private contentService: ContentService
  ) { }

  ngOnInit() {
    let flattenedMatches = Object.values(this.bnus.tabMatches).reduce((acc, val) => acc.concat(val), []);
    merge(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .pipe(filter(()=>flattenedMatches.includes(this.router.url.split('/')[1]))),
      of(null)
    )
    .subscribe((e)=>{
      this.tabName = this.bnus.getActivatedTabName(this.router.url)
    })

    // Check if the user is connected
    this.contentService.userStorageObservable.gso$().subscribe((user) => {
      console.log("user", user);
      if (user && user.id) {
        this.profileButtonText = "Profil";
        this.profileButtonDestination = "profile";
      }
    });
  }

  goToTab(target:string){
    // Navigate to the target tab
    if (this.bnus.tabSequences.indexOf(target) < this.bnus.tabSequences.indexOf(this.tabName || 'dashboard')) {
      console.log("back")
      this.navController.navigateRoot(['/' + target], { animated: false });
      // this.navController.navigateBack(['/' + target], { animated: false, animationDirection: 'back' });
    } else {
      console.log("forward")
      this.navController.navigateRoot(['/' + target], { animated: false });
      // this.navController.navigateForward(['/' + target], { animated: false, animationDirection: 'forward' });
    }

  }
}
