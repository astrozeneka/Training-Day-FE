import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tr } from 'date-fns/locale';
import { catchError, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { FeedbackService } from 'src/app/feedback.service';

@Component({
  selector: 'app-video-home',
  templateUrl: './video-home.page.html',
  styleUrls: ['./video-home.page.scss']
})
export class VideoHomePage implements OnInit {

  isVideoDisabled = true; // ONly available for premium users
  isUserLoggedIn = false;
  shouldShowSubscriptionCTA = false;

  videoOptions: ('training' | 'boxing')[] = []

  constructor(
    private router: Router,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

    // Load user data
    this.loadUserData();
  }

  async ionViewWillEnter() {
    // A parallel check to ensure to refresh the user data
    // console.log("$$$$", (await this.contentService.storage.get('user'))?.renewable_id)
    const userId: number|undefined = (await this.contentService.storage.get('user'))?.id
    if(userId){
      this.contentService.getOne(`/users/${userId}`, {})
        .pipe(catchError((error) => {
          if(error){
            this.feedbackService.register("Votre session a expiré, veuillez vous reconnecter", "danger")
            this.contentService.logout()
          }
          return throwError(() => error)
        }))
        .subscribe(async (user: any) => {
          if (user) {
            this.contentService.userStorageObservable.updateStorage(user)
          } else {
            this.contentService.logout()
          }
        });
      this.loadUserData();
    }
  }

  navigateToCategory(route: string, category: string) {
    this.router.navigate([route], { queryParams: { category: category } });
  }

  // Load user data from the content service
  private loadUserData() {
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user) => {
      console.log('User with renewable_id:', user.renewable_id);
      if (!user) {
        this.isUserLoggedIn = false;
        this.shouldShowSubscriptionCTA = false;
      } else if (user.function === 'coach' || user.function === 'nutritionist' || user.function === 'admin') {
        // Coaches and nutritionists have full access
        this.videoOptions = ['training', 'boxing'];
        this.isUserLoggedIn = true;
        this.isVideoDisabled = false;
        this.shouldShowSubscriptionCTA = false;
      } else if (user.renewable_id == null){
        this.isUserLoggedIn = true;
        this.isVideoDisabled = true;
        this.videoOptions = [];
        this.cdr.detectChanges();
        // console.log("Video disabled for user without renewable_id")
        // Show subscription CTA if user doesn't have renewable_id and is a customer
        this.shouldShowSubscriptionCTA = user.function === 'customer';
      } else if (user.renewable_id == 'hoylt' && !user.user_settings['training_option']) {
        // Navigate to the training program selection page
        this.router.navigate(['/training-program-selection']);
        this.shouldShowSubscriptionCTA = false;
      } else if (user.renewable_id == 'hoylt' && user.user_settings['training_option']) {
        this.videoOptions = [user.user_settings['training_option']];
        this.isUserLoggedIn = true;
        this.isVideoDisabled = false;
        this.shouldShowSubscriptionCTA = false;
      } else if (user.renewable_id == 'gursky' || user.renewable_id == 'smiley' || user.renewable_id == 'alonzo') {
        // For higher renewable_id users
        console.log('User with renewable_id:', user.renewable_id);
        this.videoOptions = ['training', 'boxing'];
        this.isUserLoggedIn = true;
        this.isVideoDisabled = false;
        this.shouldShowSubscriptionCTA = false;
      } else { // For higher renewable_id users
        // this.videoOptions = ['training', 'boxing']; // Default options
        // this.isUserLoggedIn = true;
        // this.isVideoDisabled = false;
        // this.shouldShowSubscriptionCTA = false;
      }
    });
  }

  public navigateTo(route: string) {
    this.router.navigate([route]);
  }

}
