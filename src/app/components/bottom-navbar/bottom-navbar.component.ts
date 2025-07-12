import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { filter, merge, of } from 'rxjs';
import { BottomNavbarUtilsService } from 'src/app/bottom-navbar-utils.service';
import { ContentService } from 'src/app/content.service';
import { use } from 'video.js/dist/types/tech/middleware';

@Component({
  selector: 'app-bottom-navbar',
  template: `
<div class="bottom-navbar">
  <div class="nav">
    <ion-button
      fill="clear"
      (click)="goToTab('home')"
      [class]="tabName === 'home' ? 'active' : ''"
    >
      <div class="inner">
        <ion-icon src="/assets/icon/menu/home.svg" class="home-icon"></ion-icon>
        <div class="label">Accueil</div>
      </div>
    </ion-button>
    <ion-button
      fill="clear"
      (click)="goToTab('tools')"
      [class]="tabName === 'tools' ? 'active' : ''"
    >
      <div class="inner">
        <ion-icon src="/assets/icon/menu/tools.svg" class="tools-icon"></ion-icon>
        <div class="label">Accessoires</div>
      </div>
    </ion-button>
    <div>
      <ion-button
        fill="solid"
        color="primary"
        class="central-button"
        (click)="goToTab('video-home')"
        [class]="tabName === 'video-home' ? 'active' : ''"
        shape="round"
      >
        <div class="inner">
          <ion-icon src="/assets/icon/menu/training-v4.svg"></ion-icon>
        </div>
      </ion-button>
    </div>
    <ion-button
      fill="clear"
      (click)="goToTab('recipe-home')"
      [class]="tabName === 'recipe-home' ? 'active' : ''"
    >
      <div class="inner">
        <ion-icon src="/assets/icon/menu/nutrition.svg" class="nutrition-icon"></ion-icon>
        <div class="label">Nutrition</div>
      </div>
    </ion-button>
    <ion-button
      fill="clear"
      (click)="goToTab(profileButtonDestination)"
      [class]="tabName === 'profile' ? 'active' : ''"
    >
      <div class="inner">
        <div class="icon-container">
          <ion-icon src="/assets/icon/menu/profile.svg" class="profile-icon"></ion-icon>
          <div class="badge" *ngIf="profileBadgeDisplayed">1</div>
        </div>
        <div class="label">{{ profileButtonText }}</div>
      </div>
    </ion-button>
  </div>
</div>
  `,
  styles: [`

.nav{
    display: flex;
    border-top: 1px solid var(--ion-color-lightgrey);
    background: var(--ion-background-color);
    
    & ion-button{
        flex: 1;
        margin: 0;
        --padding-start: 0px;
        --padding-end: 0px;
        --padding-top: 17px;
        --padding-bottom: 17px;
        height: 63px;

        & .inner{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
        }

        & ion-icon{
            height: 24px;
            width: 24px;
            fill: #484848;
        }

        & .label{
            // color: #484848;
            color: var(--ion-color-darkgrey);
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
            text-transform: none!important;

            /*&.active .label{
                background: #9C2829;
            }*/
        }


        /* Inactive button colorings */
        & .home-icon, & .profile-icon{
            //fill: #484848;
            fill: var(--ion-color-darkgrey);
        }
        & .tools-icon{
            //stroke: #484848;
            stroke: var(--ion-color-darkgrey);
            fill: none;
        }

        & .nutrition-icon{
            fill: none;
            //stroke: #484848;
            stroke: var(--ion-color-darkgrey);
        }

        & .icon-container {
          position: relative;
          display: inline-block;
        }

        & .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background-color: var(--ion-color-danger, #eb445a);
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
          z-index: 10;
          border: 2px solid var(--ion-background-color, white);
          box-sizing: border-box;
        }


        &.active{
            & .label{
                color: var(--ion-color-primary);
                font-weight: 500;
            }
            /* Each Icon have different design */
            & .home-icon, & .profile-icon{
                fill: var(--ion-color-primary);
            }
            & .tools-icon{
                stroke: var(--ion-color-primary);
                fill: none;
            }
            & .nutrition-icon{
                fill: none;
                stroke: var(--ion-color-primary);
            }

            /*
            & ion-icon{
                fill: #9C2829;
                stroke: #9C2829;
                
            }
            */
        }
    }

    & ion-button.central-button{
        --border-radius: 50%;
        --padding-start: 0px!important;
        --padding-end: 0px!important;
        --padding-top: 0px!important;
        --padding-bottom: 0px!important;
        
        --background: linear-gradient(135deg, 
            #ffffff 0%, 
            #f0f0f0 15%, 
            #e0e0e0 35%, 
            #d0d0d0 55%, 
            #c0c0c0 75%, 
            #a8a8a8 100%);
        
        --background-activated: linear-gradient(135deg, 
            #f5f5f5 0%, 
            #e8e8e8 15%, 
            #d8d8d8 35%, 
            #c8c8c8 55%, 
            #b8b8b8 75%, 
            #a0a0a0 100%);
        
        --background-focused: var(--background);
        --background-hover: var(--background-activated);
        
        --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25), 
                        0 2px 6px rgba(0, 0, 0, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3);
        
        --border-width: 2px;
        --border-style: solid;
        --border-color: transparent;
        
        margin-top: -6px;
        margin-bottom: 0px;
        margin-left: 10px;
        margin-right: 0px;
        width: 60px!important;
        height: 60px!important;
        position: relative;
        
        /*&::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, #C8A56A, #B8956A, #A8856A);
            border-radius: 50%;
            z-index: -1;
        }*/
        
        & ion-icon{
            position: absolute;
            font-size: 46px!important;
            color: white!important;
            width: 51px;
            height: 42px;
            transform: translate(-50%, -50%);
            top: 50%;
            left: 50%;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
            z-index: 1;
        }
    }
}


  `]
})
export class BottomNavbarComponent  implements OnInit {
  // Similar to as with 'Kakoo' but here, the fixedMode is default, no other behavior is implemented
  @Input() tabName: string|null = null // No need to add @Input

  // The right-most button shows different text depending on if the user is connected or not
  profileButtonText: string = "Se connecter"
  profileButtonDestination: string = "login"

  // If the user doesn't have a renewable_id, we display a badge on the profile button
  profileBadgeDisplayed: boolean = false;

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
      if (user && user.id) {
        this.profileButtonText = "Profil";
        this.profileButtonDestination = "profile";
      }
    });
  }

  ionViewWillEnter() {
    this.contentService.userStorageObservable.getStorageObservable().subscribe(async(user)=>{
      this.profileBadgeDisplayed = user.renewable_id == null && user.active_entitled_subscription == null && user.function === 'customer';
    })
  }

  goToTab(target:string){
    // Navigate to the target tab
    if (this.bnus.tabSequences.indexOf(target) < this.bnus.tabSequences.indexOf(this.tabName || 'dashboard')) {
      this.navController.navigateRoot(['/' + target], { animated: false });
      // this.navController.navigateBack(['/' + target], { animated: false, animationDirection: 'back' });
    } else {
      this.navController.navigateRoot(['/' + target], { animated: false });
      // this.navController.navigateForward(['/' + target], { animated: false, animationDirection: 'forward' });
    }

  }
}
