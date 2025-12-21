import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, EMPTY, filter, from, shareReplay, switchMap } from 'rxjs';
import { BottomNavbarUtilsService } from 'src/app/bottom-navbar-utils.service';
import { StaffAppointment } from 'src/app/components/appointment-list/appointment-list.component';
import { ContentService } from 'src/app/content.service';
import Store from 'src/app/custom-plugins/store.plugin';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-home-v2',
  templateUrl: './home-v2.page.html',
  styleUrls: ['./home-v2.page.scss']
})
export class HomeV2Page implements OnInit {

  // User data (you'll need to integrate with your user service)
  user: any = null;

  // Search functionality
  searchControl = new FormControl('');
  searchResults: any = null;
  isSearching = false;
  showSearchResults = false;
  isSearchActive = false;
  
  private searchSubscription: any;
  private searchFocusTimeout: any;

  // The videos
  videos: any[] = [];

  // The tips
  expandedTips: { [key: string]: boolean } = {};

  // The unread messages count
  unreadMessagesCount: number = 0;

  // Related to the staff appointments
  staffAppointments: StaffAppointment[] = [];
  isLoadingAppointments: boolean = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private contentService: ContentService,
    private bnus: BottomNavbarUtilsService,
    private platform: Platform
  ) { }
  
  ngOnInit() {
    this.setupSearch();
    this.loadUserData();
    this.loadUnreadCount();
    this.loadFeaturedVideos();
    this.loadStaffAppointments();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.searchFocusTimeout) {
      clearTimeout(this.searchFocusTimeout);
    }
  }
  
  ionViewWillEnter() {
    this.loadUnreadCount();
  }


  // Load user data from the content service
  private loadUserData() {
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user) => {
      this.user = user;
      this.cdRef.detectChanges();
    });
  }

  private loadUnreadCount() {
    this.contentService.getOne('/conversations/unread-count', {}).subscribe((res: any) => {
      console.log('Unread count response:', res);
      if (res && res.unread_count && typeof res.unread_count === 'number') {
        this.unreadMessagesCount = res.unread_count;
      } else {
        this.unreadMessagesCount = 0;
      }
      this.cdRef.detectChanges();
    }, (error) => {
      console.error('Error loading unread count:', error);
      this.unreadMessagesCount = 0;
    });
  }
  
  getRemainingTrialDays(trialExpiresAt: string): number {
    const trialEndDate = new Date(trialExpiresAt);
    const currentDate = new Date();
    const timeDifference = trialEndDate.getTime() - currentDate.getTime();
    const days = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(days);
  }

  // Search functionality
  private setupSearch() {
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (!query || query.trim().length < 2) {
          this.showSearchResults = false;
          this.searchResults = null;
          this.isSearching = false;
          return EMPTY;
        }

        this.isSearching = true;
        this.showSearchResults = true;

        // Use the actual API endpoint from environment
        return this.http.get<any>(`${environment.apiEndpoint}/search?query=${encodeURIComponent(query)}`)
          .pipe(
            catchError((error) => {
              console.error('Search error:', error);
              this.isSearching = false;
              this.showSearchResults = false;
              return EMPTY;
            })
          );
      })
    ).subscribe((response: any) => {
      this.isSearching = false;
      if (response && response.status === 'success') {
        this.searchResults = response.data;
      } else {
        this.searchResults = { videos: [], recipes: [], applinks: [] };
      }
      this.cdRef.detectChanges();
    });
  }

  // Load featured videos
  featuredVideoIsLoading: boolean = false;
  private loadFeaturedVideos() {
    this.featuredVideoIsLoading = true;
    this.contentService.getCollection('/videos', 0, { f_category: 'home' }).subscribe((res: any) => {
      this.videos = res.data as any[];
      this.featuredVideoIsLoading = false;
      this.cdRef.detectChanges();
    });
  }

  // Add these utility methods
  goToVideo(videoId: number) {
    this.router.navigate(['/video-view/', videoId]);
  }

  getUrl(suffix: string) {
    return environment.rootEndpoint + '/' + suffix;
  }

  toggleTip(tipKey: string): void {
    this.expandedTips[tipKey] = !this.expandedTips[tipKey];
    this.cdRef.detectChanges();
  }

  openSearch() {
    this.isSearchActive = true;
    this.showSearchResults = true;
    this.bnus.setVisibility(false);
    this.cdRef.detectChanges();
  }

  handleSearchBlur() {
    if (this.searchFocusTimeout) {
      clearTimeout(this.searchFocusTimeout);
    }
    this.bnus.setVisibility(true);
    
    this.searchFocusTimeout = setTimeout(() => {
      this.closeSearch();
    }, 200);
  }

  // Close search functionality
  closeSearch() {
    this.isSearchActive = false;
    this.showSearchResults = false;
    this.searchResults = null; // Clear results for better performance
    this.isSearching = false;
    this.cdRef.detectChanges();
  }

  // Select a search result
  selectResult(result: any) {
    // Clear search immediately for better UX
    this.isSearchActive = false;
    this.showSearchResults = false;
    this.searchControl.setValue('', { emitEvent: false }); // Don't trigger search
    
    // Add haptic feedback for mobile (optional enhancement)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    if (result.route) {
      this.router.navigate([result.route]);
    }
    
    this.cdRef.detectChanges();
  }

  // Helper methods
  get searchQuery(): string {
    return this.searchControl.value || '';
  }

  hasResults(): boolean {
    return this.searchResults && (
      this.searchResults.videos?.length > 0 ||
      this.searchResults.recipes?.length > 0 ||
      this.searchResults.applinks?.length > 0
    );
  }

  getAllResults(): any[] {
    if (!this.searchResults) return [];
    
    return [
      ...(this.searchResults.videos || []),
      ...(this.searchResults.recipes || []),
      ...(this.searchResults.applinks || [])
    ];
  }

  getResultIcon(entity: string): string {
    const icons = {
      'video': 'play-circle',
      'recipe': 'restaurant',
      'applink': 'apps'
    };
    return icons[entity] || 'document';
  }

  getResultType(entity: string): string {
    const types = {
      'video': 'Vidéo',
      'recipe': 'Recette',
      'applink': 'Application'
    };
    return types[entity] || 'Contenu';
  }

  // Navigation method
  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  async clickShareApp() {
    if (this.platform.is("ios")) {
      let link = 'https://apps.apple.com/app/id1234567890'; // Replace with your iOS app link
      let res = await Store.displayShareSheet({message: link});
      console.log(res);
    } else if (this.platform.is("android")) {
      let link = 'https://play.google.com/store/apps/details?id=com.example.app'; // Replace with your Android app link
      let res = await Store.displayShareSheet({message: link});
      console.log(res);
    }
  }

  async goToMessenger() {
    if(this.user) {
      this.router.navigate(['/messenger-master']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateToCategory(route: string, category: string) {
    this.router.navigate([route], { queryParams: { category: category } });
  }

  // Related to the appointments
  loadStaffAppointments() {
    var bearerToken$ = from(this.contentService.storage.get('token')).pipe(
      shareReplay(1)
    );


    this.isLoadingAppointments = true;

    let tokenAndUserLoaded = combineLatest([
      bearerToken$,
      this.contentService.userStorageObservable.getStorageObservable()
    ]);

    tokenAndUserLoaded.pipe(
      filter(([token, user]) => {
        // Only process if the user is a coach or nutritionist
        return user?.function === 'coach' || user?.function === 'nutritionist';
      }),
      switchMap(([token, user]) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        return this.http.get<any>(`${environment.apiEndpoint}/calendar/events?limit=5&status=pending`, { headers });
      })
    ).subscribe({
      next: (response) => {
        this.isLoadingAppointments = false;
        if (response.status === 'success') {
          this.staffAppointments = response.data;
        }
      },
      error: (error) => {
        this.isLoadingAppointments = false;
        console.error('Error loading staff appointments:', error);
        this.staffAppointments = [];
        /*this.feedbackMessage = 'Erreur lors du chargement des rendez-vous.';
        this.showErrorMessage = true;
        setTimeout(() => this.closeFeedback(), 3000);
        */
      }
    });
  }

  openPrivacyPolicy() {
    const url = 'https://training-day-be.codecrane.me/doc-privacy-policy';
    if (this.platform.is('capacitor')) {
      Browser.open({url: url});
    } else {
      window.open(url, '_blank');
    }
  }
}
