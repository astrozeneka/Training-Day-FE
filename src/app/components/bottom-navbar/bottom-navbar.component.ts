import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { filter, merge, of } from 'rxjs';
import { BottomNavbarUtilsService } from 'src/app/bottom-navbar-utils.service';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.component.html',
  styleUrls: ['./bottom-navbar.component.scss'],
})
export class BottomNavbarComponent  implements OnInit {
  // Similar to as with 'Kakoo' but here, the fixedMode is default, no other behavior is implemented
  @Input() tabName: string|null = null // No need to add @Input

  constructor(
    protected bnus: BottomNavbarUtilsService,
    public router: Router,
    public navController: NavController
  ) { }

  ngOnInit() {
    merge(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .pipe(filter((e) => this.bnus.tabSequences.map(e => '/' + e === this.router.url).includes(true))),
        of(null)
    )
    .subscribe((e)=>{
      this.tabName = this.router.url.replace('/', '')
    })
  }

  goToTab(target:string){
    console.log(target, this.tabName)
    console.log(this.bnus.tabSequences.indexOf(target), this.bnus.tabSequences.indexOf(this.tabName!))
    if (this.bnus.tabSequences.indexOf(target) < this.bnus.tabSequences.indexOf(this.tabName || 'dashboard')) {
      console.log("back")
      this.navController.navigateBack(['/' + target], { animated: true, animationDirection: 'back' });
    } else {
      console.log("forward")
      this.navController.navigateForward(['/' + target], { animated: true, animationDirection: 'forward' });
    }

  }
}
