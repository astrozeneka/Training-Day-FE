import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ContentService } from "../../content.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

// import { register } from 'swiper/element/bundle';
import { FormComponent } from "../../components/form.component";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FeedbackService } from "../../feedback.service";
import { environment } from "../../../environments/environment";
import { Navigation, Pagination } from 'swiper/modules';
import { register } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';



@Component({
  selector: 'app-home',
  template: `
    <ion-header>
    <ion-toolbar>
        <ion-buttons slot="start">
            <app-back-button [customUrl]="'welcome-menu'"></app-back-button>
            <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Training Day</ion-title>
    </ion-toolbar>
</ion-header>

<ion-content>
    <p></p>
    <div>
        <!--
          Have a small bug on iphone
          SHould be updated
        -->
    </div>

    <h2 class="ion-padding">Bienvenue sur Training Day</h2>


    <div *ngIf="user">
        <ion-card color="warning" class="ion-padding"
            *ngIf="user.trial_is_active && !(user.subscription_is_active || (user.grouped_perishables && user.grouped_perishables['sport-coach']) || (user.grouped_perishables && user.grouped_perishables['food-coach']))">
            Vous disposez d'un essai gratuit de {{ getRemainingTrialDays(user.trial_expires_at) }} jours. Profitez-en
            pour discuter avec votre coach.
            L'essai se terminera le {{ user.trial_expires_at | date:'dd MMMM yyyy' }}.
        </ion-card>
    </div>
    <div>

        <div *ngIf="user?.appointments?.length > 0">
            <h1 class="display-1 ion-padding">Mes rendez-vous</h1>
            <ion-card color="warning ion-padding" class="appointment-card"
                *ngFor="let appointment of user.appointments">
                <ion-icon name="calendar"></ion-icon>
                <div>
                    Vous avez un rendez-vous planifié le
                    <b>
                        {{ appointment.datetime | date:'dd MMMM yyyy' }}
                    </b>
                    à
                    <b>
                        {{ appointment.datetime | date:'HH:mm' }}
                    </b>

                    <br />
                    <b>Motif :</b> {{ appointment.reason }}<br />

                </div>
            </ion-card>
        </div>


        <h1 class="display-1 ion-padding">Mes Applications</h1>
        <div class="container">
            <!-- Additional required wrapper -->
            <swiper-container navigation="false" pagination="true" autoplay-delay="2500" css-mode="false" loop="true"
                #swiperEl init="true">
                <swiper-slide>
                    <div class="image-container">
                        <img title="GPS" src="../../../assets/medias/IMG_0962_1024x683.jpeg" />
                    </div>
                    <div class="description">
                        <p>
                            Entraînez-vous avec l'application chronomètre réglable pour chaque tour d'entraînement.
                        </p>
                        <h3>
                            <span>Chronomètre</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-timer')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <div class="image-container">
                        <img title="GPS" src="../../../assets/medias/IMG_0961_1024x683.jpeg" />
                    </div>
                    <div class="description">
                        <p>
                            Calculez vos kilomètres parcourus avec l'application GPS.
                        </p>
                        <h3>
                            <span>Course</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-gps')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <div class="image-container">
                        <img title="GPS" src="../../../assets/medias/IMG_0964_1024x683.jpeg" />
                    </div>
                    <div class="description">
                        <p>
                            Découvrez notre application calculateur d'IMC pour connaître votre indice de masse
                            corporelle.
                        </p>
                        <h3>
                            <span>Calculateur d'IMC</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-imc')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <div class="image-container">
                        <img title="IMC" src="../../../assets/medias/IMG_0965_1024x683.jpeg" />
                    </div>
                    <div class="description">
                        <p>
                            Découvrez notre application calculateur de calories.
                        </p>
                        <h3>
                            <span>Calculateur de calories</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-calories')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <div class="image-container">
                        <img title="Suivi du poids" src="../../../assets/medias/image-calendar-2_612x250.jpeg" />
                    </div>
                    <div class="description">
                        <p>
                            Découvrez notre application suivi du poids.
                        </p>
                        <h3>
                            <span>Suivi du poids</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-weight-tracking')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
            </swiper-container>
        </div>
    </div>


    <div class="premium-subscription ion-padding">
        <h1 class="display-1">Un accompagnement et un suivi réel et personnalisé</h1>
        <p>
            Nos solutions d’accompagnement vous permettent d'accéder à des programmes d'entraînement personnalisés et un
            suivi avec un coach personnel.
        </p>
        <p>
            Rendez-vous à la page abonnement afin de trouver la solution qui vous convient.
        </p>
        <div>
            <ion-button (click)="navigateTo('/swipeable-store')">Découvrir les offres</ion-button>
        </div>
    </div>

    <div class="">
        <h1 class="display-1 ion-padding">Découvrez les nouvelles actualités sportifs sur Training-Day</h1>
        <div class="list-container">
            <div class="video-card ion-padding" *ngFor="let video of videos">
                <div class="left" (click)="goToVideo(video.id)">
                    <img src="/assets/logo-light-1024x1024-noalpha.jpg" alt="Vidéo thumbnail" class="card-image"
                        *ngIf="!video.thumbnail" />
                    <img [src]="getUrl(video.thumbnail.permalink)" alt="Vidéo thumbnail" class="card-image"
                        *ngIf="video.thumbnail" />
                    <ion-icon name="play-circle-outline"></ion-icon>
                </div>
                <div class="right">
                    <h3 class="card-title" (click)="goToVideo(video.id)">{{ video['title'] }}</h3>
                    <!--<div class="stars">
                            <ion-icon name="star-outline"></ion-icon>
                            <ion-icon name="star-outline"></ion-icon>
                            <ion-icon name="star-outline"></ion-icon>
                            <ion-icon name="star-outline"></ion-icon>
                            <ion-icon name="star-outline"></ion-icon>
                        </div>-->
                    <p>{{ video['description'] }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Autres contenus -->
    <div>
        <h1 class="display-1 ion-padding">Autres astuces et conseils</h1>
        <div class="misc-list">
            <div class="misc-item">
                <img title="Les calories" sr
                    c="../../../assets/medias/plat-bol-bouddha-legumes-legumineuses-vue-dessus-1024x683.jpeg"
                    style="scale: 2.8">
                <div class="ion-padding">
                    <h3 class="display-1">Les calories</h3>
                    <p>
                        Chaque jour, votre corps a besoin d’énergie pour fonctionner et accomplir correctement ses
                        missions. Cette énergie nous est fournie par les aliments que nous consommons et s’exprime en
                        calories.
                        <br />
                    </p>
                    <p>
                        <span #calory id="calory">
                            La calorie est une unité de mesure de l’énergie couramment utilisée en nutrition. Par
                            habitude, on évoque nos besoins journaliers en "calories", mais il s'agit en fait de
                            kilocalories (kcal). 1 kilocalorie = 1 000 calories.
                        </span>
                        <ion-button (click)="toggleContent(calory, $event)">
                            Plus
                        </ion-button>
                    </p>
                </div>
            </div>
            <div class="misc-item">
                <img title="Rééquilibrage alimentaire"
                    src="../../../assets/medias/femme-active-mesurant-sa-taille-1024x767.jpeg" style="scale: 2.8">
                <div class="ion-padding">
                    <h3 class="display-1">Rééquilibrage alimentaire</h3>
                    <p>
                        Dans notre société sédentaire, où l'abondance et la consommation effrénée sont les maîtres-
                        mots, chacun d'entre nous est constamment sollicité par les médias par des discours
                        contradictoires.
                        <br />
                    </p>
                    <p>
                        <span #reequilibrage id="reequilibrage">
                            Dans un tel contexte, il peut être difficile de se repérer parmi les informations qui nous
                            parviennent continuellement. « 5 fruits et légumes par jour », « 10000 pas par jour », «
                            limiter les aliments gras, salés, sucrés » : tout le monde connaît ces messages de santé
                            publique. Pour autant, il n'est pas toujours aisé de les mettre en œuvre au quotidien.
                        </span>
                        <ion-button (click)="toggleContent(reequilibrage, $event)">
                            Plus
                        </ion-button>
                    </p>
                </div>
            </div>
        </div>
        <!-- debug section (only used while debugging) -->
        <!--
            <div>
                <h2 class="display-1 ion-padding-horizontal">Debug section</h2>
                <div>
                    {{ token }}
                </div>
                <div>
                    <ion-button fill="clear" (click)="unvalidateToken()">Unvalidate token</ion-button>
                </div>
                <div>
                    <ion-button fill="clear" (click)="refreshToken()">Refresh token</ion-button>
                </div>
            </div>
            -->
        <br />
        <br />
        <br />
        <br />
        <br />
    </div>

    <app-button-to-chat></app-button-to-chat>
</ion-content>
  `,
  styles: [`
    @import '../../../mixins';

#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

h2 {
  @include display-1;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}


@media screen and (min-width: 768px) {

  /* Apply the always-open-menu class to the ion-menu component */
  .always-open-menu {
    background: red !important;
    --ion-menu-width: auto;
    /* Set the menu width to "auto" to keep it open */
  }
}


#home-card-list {
  ion-card {
    border-radius: 2em;
  }

  p.placeholder {
    display: inline-block;
    height: 3pt;
  }

  ion-card-title {
    margin: 0;
    padding: 0;
    padding-bottom: 1pt;
    align-items: center;
    flex-direction: row;
    display: flex;
    font-size: 1.9em;

    span {}

    ion-button {
      margin-left: 2em;
    }
  }
}

// 2. The swipper
.swiper {
  width: 100%;
  height: 380px;
}

:host {
  --swiper-navigation-color: var(--ion-color-primary); // Replace with your desired color value
}


swiper-slide {
  position: relative;
  height: 380px;
  display: flex;
  align-items: flex-end;
  padding: 1em;
  background: var(--ion-color-light);

  & .icon {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 300px;
    opacity: 0.1;
  }

  & .description {
    flex: 1;
    text-align: right;
    padding-left: 2em;
    padding-right: 2em;
  }

  & h3 {
    color: white;
    display: flex;
    justify-content: right;
    align-items: center;
    text-shadow: 0 0 10px black;

    & span {
      @include display-1;
    }
  }

  & p {
    color: white;
    text-shadow: 0 0 10px black;
  }

  & svg {
    stroke: red !important;
  }

  & ion-button {
    margin-bottom: 1em;
  }

  & .image-container {
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -999;
    width: 100%;
    height: 100%;

    img {
      position: relative;
      filter: blur(.5px) brightness(0.8);
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}


// 3. The premium-subscription
.premium-subscription {
  padding-top: 3em;

  & p {
    color: var(--ion-color-medium);
  }
}


.video-card {
  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 1em;

  .left {
    //min-width: 100px;
    //max-width: 200px;
    overflow: hidden;
    //position: relative;

    display: flex;
    height: 120px;
    width: 200px;
    min-width: 200px;
    align-items: center;
    flex-direction: row;

    img {
      scale: 1.0;
    }

    ion-icon {
      display: none;
      // color: var(--ion-color-dark);
      color: var(--ion-color-medium);
      font-size: 5em;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .right {
    h3 {
      @include display-1;
      cursor: pointer;
    }

    .stars {
      color: var(--ion-color-warning);
    }

    p {
      color: var(--ion-color-medium);
      font-size: .8em;
    }
  }

  p,
  h3 {
    margin: 0;
  }
}

.video-card:hover .left ion-icon {
  color: var(--ion-color-secondary);
}

.misc-list {
  .misc-item {
    margin-top: 1em;
    margin-bottom: 1em;
    position: relative;
    overflow: hidden;

    & img {
      position: absolute;
      z-index: -999;
      filter: brightness(0.8);
      // Make it gradient from opaque (top) to opaque (80% height) to transparent (bottom)
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0));
      scale: 1.5;
    }

    &>div {
      padding-top: 3em;
      padding-bottom: 3em;
    }

    & p,
    & h3 {
      z-index: 999;
      color: white;
      text-shadow: 0 0 10px black;
    }

    ion-button {
      margin-top: 1em;
    }
  }
}

.appointment-card {
  display: flex;
  flex-direction: row;
  align-items: center;

  &>ion-icon {
    padding-right: 1em;
    font-size: 1.5em;
  }

  &>div {
    flex: 1;
  }
}`]
})
export class HomePage extends FormComponent implements OnInit, AfterViewInit {
  user: any = null
  content: any = null

  videos: any = []

  // Used for debugging only
  token: string = undefined

  override form = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email])
  })

  // The swiper at the top of the page
  @ViewChild('swiperEl') swiperEl: ElementRef | null = null as any

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private feedbackService: FeedbackService
  ) {
    super()
    this.route.params.subscribe(async (params) => {
      //await this.loadData()
    })
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd && this.router.url == '/home') {
        this.contentService.getCollection('/videos', 0, { f_category: 'home' }).subscribe((res: any) => {
          this.videos = res.data as object
        })
      }
    })
    // register()
  }

  async ngOnInit() {
    let hiddeableIds = ['calory', 'reequilibrage']
    let hiddeableElts = hiddeableIds.map((id) => document.getElementById(id))
    hiddeableElts.forEach((elt) => {
      if (elt) {
        elt.style.display = 'none'
      }
    })

    // The user data
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user) => {
      this.user = user
    })

    // Debugging (to be removed later)
    this.contentService.storage.get('token').then((token) => {
      this.token = token
    })
  }

  async ngAfterViewInit() {
    register()
    const swiperParams: SwiperOptions = {
      modules: [Navigation, Pagination],
      injectStylesUrls: [
        './node_modules/swiper/modules/navigation-element.min.css',
        './node_modules/swiper/modules/pagination-element.min.css'
      ]
    }
    Object.assign(this.swiperEl?.nativeElement, swiperParams)
    //this.swiperEl.nativeElement.initialize()
    console.log(this.swiperEl.nativeElement)
  }

  onSwiper(event: any) {

  }

  onSlideChange() {
  }

  navigateTo(url: string) {
    this.router.navigate([url])
  }

  registerToWaitingList() {
    this.contentService.post('/waiting-list', this.form.value)
      .subscribe((data) => {
        this.feedbackService.registerNow('Votre email à bien été enregistré.', 'success')
      })
  }

  goToVideo(video_id: number) {
    this.router.navigate(['/video-view/', video_id])
  }

  getUrl(suffix: string) {
    return environment.rootEndpoint + '/' + suffix
  }

  toggleContent(element: HTMLElement, event: any): void {
    if (element.style.display === 'none') {
      element.style.display = 'block';
      event.target.innerText = 'Cacher';
    } else {
      element.style.display = 'none';
      event.target.innerText = 'Voir plus';
    }
  }

  getRemainingTrialDays(trialExpiresAt: string): number {
    const trialEndDate = new Date(trialExpiresAt);
    const currentDate = new Date();
    const timeDifference = trialEndDate.getTime() - currentDate.getTime();
    const days = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(days);
  }

  /**
   * Used for debugging
   */
  async unvalidateToken() {
    let token = await this.contentService.storage.get('token')
    let bearerHeaders = await this.contentService.bearerHeaders()
    console.log(`Token now: ${token}`, bearerHeaders)
    await this.contentService.storage.set('token', 'invalid_token');

    token = await this.contentService.storage.get('token')
    console.log(`Token is now: ${token}`, bearerHeaders)
  }

  async refreshToken() {
    let token = await this.contentService.storage.get('token')
    console.log(`Token is: ${token}`)

    this.contentService.refreshToken().subscribe((res: any) => {
      // Sleep 1s
      setTimeout(async () => {
        let newToken = await this.contentService.storage.get('token')
        console.log(`Token has changed: ${token} -> ${newToken}`)
        this.token = newToken
        this.cdRef.detectChanges()
      }, 1000)
    })
  }
}
