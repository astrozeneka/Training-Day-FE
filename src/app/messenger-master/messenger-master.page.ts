import { ChangeDetectorRef, Component, ElementRef, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActionSheetController, IonContent, IonSearchbar, LoadingController, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { User } from '../models/Interfaces';
import { Conversation, Msg } from '../messenger-interfaces';
import { BehaviorSubject, catchError, combineLatest, concat, filter, from, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../content.service';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { MessengerService } from '../messenger.service';
import { environment } from 'src/environments/environment';
import Echo from 'laravel-echo';
import { PusherPrivateChannel } from 'laravel-echo/dist/channel';
import { NativeAudio } from '@capgo/native-audio';
import { Haptics } from '@capacitor/haptics';

// HTTP Cache Interceptor for optimizing conversation requests
@Injectable()
export class ConversationCacheInterceptor implements HttpInterceptor {
  private readonly CACHE_PREFIX = 'http_cache_';
  private cacheDuration = 5 * 60 * 1000; // 5 minutes cache duration

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log("Intercepting request for caching", req.url);
    // Only cache GET requests to conversations endpoint
    if (req.method !== 'GET' || !req.url.includes('/conversations')) {
      return next.handle(req);
    }

    const cacheKey = this.getCacheKey(req);
    const cached = this.getCachedResponse(cacheKey);

    // Cache-then-network strategy: emit cached data first, then fetch fresh data
    if (cached && this.isCacheValid(cached.timestamp)) {
      // Emit cached response first, then network response
      const cachedResponse$ = of(cached.response.clone());
      const networkResponse$ = this.fetchAndCache(req, next, cacheKey);

      return concat(cachedResponse$, networkResponse$);
    }

    // No valid cache, just fetch from network
    return this.fetchAndCache(req, next, cacheKey);
  }

  private fetchAndCache(req: HttpRequest<any>, next: HttpHandler, cacheKey: string): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cacheResponse(cacheKey, event);
        }
      })
    );
  }

  private getCacheKey(req: HttpRequest<any>): string {
    const authHeader = req.headers.get('Authorization') || '';
    const url = req.urlWithParams;
    const rawKey = `${url}|${authHeader}`;
    return this.hashString(rawKey);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `${this.CACHE_PREFIX}${Math.abs(hash).toString(36)}`;
  }

  private getCachedResponse(cacheKey: string): { response: HttpResponse<any>, timestamp: number } | null {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      return {
        response: new HttpResponse({
          body: parsed.body,
          headers: parsed.headers,
          status: parsed.status,
          statusText: parsed.statusText,
          url: parsed.url
        }),
        timestamp: parsed.timestamp
      };
    } catch (e) {
      console.error('Error reading cache:', e);
      return null;
    }
  }

  private cacheResponse(cacheKey: string, response: HttpResponse<any>): void {
    try {
      const cacheData = {
        body: response.body,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.error('Error writing cache:', e);
    }
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheDuration;
  }

  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
  }

  invalidateCache(url: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (cached && cached.includes(url)) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (e) {
      console.error('Error invalidating cache:', e);
    }
  }
}

@Component({
  selector: 'app-messenger-master',
  styleUrls: ['./messenger-master.page.scss'],
  template: `
  <!-- Header -->
<ion-header class="header">
  <ion-toolbar class="toolbar">
    <ion-buttons slot="start">
      <ion-button class="back-button" (click)="goBack()">
        <ion-icon name="arrow-back-outline" class="back-icon"></ion-icon>
      </ion-button>
    </ion-buttons>
    <ion-title class="title">Messagerie</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div class="container">
    <!-- Availability Toggle -->
    <app-coach-messenger-settings *ngIf="staffMenuAvailable"></app-coach-messenger-settings>

    <!-- Search Bar -->
    <div class="search-container" *ngIf="staffMenuAvailable">
      <ion-searchbar
        #searchbar
        placeholder="Rechercher une conversation"
        animated="true"
        class="search-bar"
        (ionInput)="searchChats($event)"
      ></ion-searchbar>
    </div>

    <!-- User Type Selection -->
    <div class="user-type-tabs" *ngIf="userTypeSwitchAvailable">
      <div 
        class="tab-item {{userType === 'coach' ? 'active' : ''}}"
        (click)="setUserType('coach')"
      >
        Coach
      </div>
      <div 
        class="tab-item {{userType === 'nutritionist' ? 'active' : ''}}"
        (click)="setUserType('nutritionist')"
      >
        Nutritionniste
      </div>
    </div>

    <!-- Loading Shimmer Effect (shown when loading) -->
    <div class="shimmer-container" *ngIf="isLoading">
      <div *ngFor="let i of [1,2,3,4,5]" class="shimmer-item">
        <div class="shimmer-content">
          <div class="shimmer-avatar"></div>
          <div class="shimmer-text">
            <div class="shimmer-title"></div>
            <div class="shimmer-subtitle"></div>
          </div>
          <div class="shimmer-meta">
            <div class="shimmer-time"></div>
            <div class="shimmer-badge"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat List -->
    <div class="chat-list" *ngIf="!isLoading">
      <ng-container *ngIf="filteredChats.length > 0; else emptyState">
        <!--{{ filteredChats.length }}-->
        <div 
          *ngFor="let chat of filteredChats" 
          class="chat-item"
          (click)="navigateToChat(chat.id)"
        >
          <div class="chat-content">
            <ion-avatar class="chat-avatar">
              <img *ngIf="chat.avatar" [src]="chat.avatar" [alt]="chat.name + ' profile picture'">
              <img *ngIf="!chat.avatar" src="../../../assets/samples/profile-sample-1.jpg" [alt]="chat.name + ' profile picture'">
            </ion-avatar>
            
            <div class="chat-details">
              <div class="chat-header">
                <h3 class="chat-name">{{chat.name}}</h3>
                <span class="chat-time">{{chat.updated_at | date:'short'}}</span>
              </div>
              <div class="chat-footer">
                <p class="chat-message">{{chat.latest_message?.content || 'Aucun message récent'}}</p>
                <div *ngIf="chat.unread_count && chat.unread_count > 0" class="unread-badge">
                  <span>{{chat.unread_count}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
      
      <!-- Empty State -->
      <ng-template #emptyState>
        <div class="empty-state" *ngIf="!isGuest">
          <ion-icon name="chatbubbles-outline" class="empty-icon"></ion-icon>
          <h3 class="empty-title">Aucune conversation</h3>
          <p class="empty-subtitle">
            Aucune conversation trouvée.
          </p>
        </div>
      </ng-template>
    </div>

    <!-- Chat Permissions Section (for customers only) -->
    <div class="permissions-section" *ngIf="(isCustomer && chatPermissions) || isGuest">
      <!-- Coach Permission Message -->
      <div class="permission-message" *ngIf="chatPermissions.message?.coach">
        <h3 class="permission-title">Coach</h3>
        <p class="permission-text">{{chatPermissions.message.coach}}</p>
        <div class="access-badge" *ngIf="chatPermissions.canChatWithCoach !== 'noaccess'">
          <span class="{{chatPermissions.canChatWithCoach === 'fullaccess' ? 'full-access' : 'limited-access'}}">
            {{chatPermissions.canChatWithCoach === 'fullaccess' ? 'Accès complet' : 'Accès limité'}}
          </span>
        </div>
      </div>

      <!-- Nutritionist Permission Message -->
      <div class="permission-message" *ngIf="chatPermissions.message?.nutritionist">
        <h3 class="permission-title">Nutritionniste</h3>
        <p class="permission-text">{{chatPermissions.message.nutritionist}}</p>
        <div class="access-badge" *ngIf="chatPermissions.canChatWithNutritionist !== 'noaccess'">
          <span class="{{chatPermissions.canChatWithNutritionist === 'fullaccess' ? 'full-access' : 'limited-access'}}">
            {{chatPermissions.canChatWithNutritionist === 'fullaccess' ? 'Accès complet' : 'Accès limité'}}
          </span>
        </div>
      </div>
      
      <!-- CTA Button for subscription -->
      <div class="cta-container" *ngIf="chatPermissions.canChatWithCoach === 'noaccess' && chatPermissions.canChatWithNutritionist === 'noaccess'">
        <p class="cta-text">Accédez à nos services de coaching personnalisé</p>
        <ion-button class="cta-button" expand="block" [routerLink]="['/swipeable-store']">
          Découvrir nos abonnements
        </ion-button>
      </div>

      <!-- Test button go to appointments -->
      <ion-button class="cta-button" expand="block" [routerLink]="['/book-appointment']" *ngIf="chatPermissions.canChatWithCoach !== 'noaccess' || chatPermissions.canChatWithNutritionist !== 'noaccess'">
        Prendre rendez-vous
      </ion-button>

    </div>
  </div>
</ion-content>`
})

export class MessengerMasterPage implements OnInit {
  @ViewChild(IonSearchbar) searchbar: IonSearchbar | undefined = undefined;

  isAvailable: boolean = false;
  userType: 'coach' | 'nutritionist' = 'coach';
  isLoading: boolean = true;
  searchQuery: string = '';

  // Sample data - in a real app, this would come from a service
  chats: Conversation[] = [];
  filteredChats: Conversation[] = [];
  user$: Observable<User>;
  userTypeSwitchAvailable: boolean = false;
  staffMenuAvailable: boolean = false;

  // Similar to what chat-detail use
  private bearerToken$: Observable<string> | undefined;

  // Used to manage the messages to displayed to the user in case some feature is not available
  isCustomer: boolean = false;
  chatPermissions: any = null;

  // In case the user is not connected
  isGuest: boolean = false;

  // The audio notification
  audio_incoming: any = undefined

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private formBuilder: FormBuilder,
    private contentService: ContentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private messengerService: MessengerService,
    private router: Router,
    private platform: Platform,
  ) {
    // The token$ is used to get the token from the content service
    this.bearerToken$ = from(this.contentService.storage.get('token')).pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    );

    // The user entity
    this.user$ = this.contentService.userStorageObservable.gso$().pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    )

    // Set the userTypeSwitchAvailable
    this.user$.subscribe(user => {
      // Check if the user is a customer
      this.isCustomer = user.function === 'customer';
      // In case of a coach
      if (user.function === 'coach')
        this.userTypeSwitchAvailable = true;
      if (user.function === 'coach' || user.function === 'nutritionist')
        this.staffMenuAvailable = true;
    })
  }

  ngOnInit() {
    // Simulate loading data
    /*setTimeout(() => {
      this.loadChatData();
      this.isLoading = false;
    }, 1500);*/

    // If the user is connected, load the permissions
    this.bearerToken$?.subscribe(token => {
      let headers = {
        'Authorization': `Bearer ${token}`
      }
      this.http.get(`${environment.apiEndpoint}/conversations`, { headers })
        .pipe(
          // Handle errors
          catchError(err => { 
            console.error('Error fetching chat data:', err);
            this.isLoading = false;
            return throwError(() => err);
          })
        )
        .subscribe((res: any) => {
          console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
          let success = res.success as boolean;
          let conversations = res.conversations as Conversation[];
          this.chats = conversations;
          console.log("Conversations loaded from the server", res); // Remove later
          // Handle chat permissions and chat cta messages
          if (res.chat_permissions) {
            this.chatPermissions = res.chat_permissions;
          }
          this.applySearchFilter();
          this.isLoading = false;
          this.cdr.detectChanges();
        })
    })

    // In case the user is not connected, display a 'noaccess' message
    this.contentService.userStorageObservable.gso$()
      .pipe(
        filter(user => !user),
        switchMap(() => {
          // Simulate a loading state
          this.isLoading = true;
          return this.http.get(`${environment.apiEndpoint}/guest-chat-permissions`);
        })
      )
      .subscribe((res: any) => {
        if (res.chat_permissions) {
          this.chatPermissions = res.chat_permissions;
        }
        this.isGuest = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      })

    // Setup the listener
    combineLatest({
      user: this.user$,
      echo: this.messengerService.echo$
    }).pipe(
      map(({ user, echo }) => this.setupEchoListenersForUser(echo, user))
    )
      .subscribe()
    
    // Load the sounds
    if (this.platform.is('capacitor')){ // mobile
      try{
        NativeAudio.preload({
          assetId: 'incoming-message.mp3',
          assetPath: 'public/assets/audio/incoming-message.mp3',
          audioChannelNum: 2,
          isUrl: false
        })
      }catch(e){
        throwError(e)
      }
    } else { // web for testing
      this.audio_incoming = new Audio()
      this.audio_incoming.src = "../../assets/audio/incoming-message.mp3"
    }
  }

  // Load chat data - in a real app, this would be a service call
  loadChatData() {
    // This is sample data - you would normally fetch this from an API
    this.chats = [];

    // this.filteredChats = [...this.chats];
  }

  toggleAvailability(event: CustomEvent | any) {
    this.isAvailable = event.detail.checked;

    // Here you would call your API to update availability status
    // this.userService.updateAvailability(this.isAvailable).subscribe(...);

    // Show toast to confirm status change
    this.showToast(`Vous êtes maintenant ${this.isAvailable ? 'disponible' : 'non disponible'}`);
  }

  setUserType(type: 'coach' | 'nutritionist') {
    this.userType = type;

    // In a real app, you would fetch different chats based on the selected type
    // this.chatService.getChatsByType(this.userType).subscribe(chats => {...});

    // For demo purposes, we'll just simulate a loading state
    this.isLoading = true;
    setTimeout(() => {
      // Simulate different data for different user types
      if (this.userType === 'nutritionist') {
        // Modify the chat data to simulate nutritionist-specific chats
        /*this.chats.forEach(chat => {
          chat.lastMessage = chat.lastMessage?.includes('entraînement')
            ? 'Parlons de votre régime alimentaire'
            : 'Avez-vous suivi le plan nutritionnel?';
        });*/
      }

      this.applySearchFilter();
      this.isLoading = false;
    }, 50);
  }

  searchChats(event: any) {
    this.searchQuery = event.detail.value?.toLowerCase() || '';
    this.applySearchFilter();
  }

  applySearchFilter() {
    this.user$.subscribe(user => {
      let filtered = [];

      // 1. Filter by userType in case of the messenger of the coach/nutritionist
      if (user.function === 'customer') {
        filtered = this.chats
      } else if (user.function === 'coach' || user.function === 'nutritionist') {
        if (this.userType === 'coach') {
          filtered = this.chats.filter(chat => chat.members.some(member => member.user.id === user.id));
          console.log("Filter by coach", this.chats, filtered);
        } else if (this.userType === 'nutritionist') {
          filtered = this.chats.filter(chat => chat.members.some(member => member.user.function === 'nutritionist'));
        }
      }

      // 2. Filter by search query
      if (!this.searchQuery) {
        this.filteredChats = [...filtered];
      } else {
        this.filteredChats = filtered.filter(chat =>
          chat.name.toLowerCase().includes(this.searchQuery)/* ||
          (chat.lastMessage && chat.lastMessage.toLowerCase().includes(this.searchQuery))*/
        );
      }
    })
  }

  navigateToChat(chatId: number) {
    // In our app, partnerId is used instead of chatId since only 1:1 chat is available
    this.router.navigate([`/messenger-detail/${chatId}`]);

    // Navigate to individual chat page
    // this.navCtrl.navigateRoot(`/chat-detail/${chatId}`);

    // In a real app, you might want to mark messages as read when opening a chat
    // this.chatService.markAsRead(chatId).subscribe();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  // LIFECYCLE HOOKS AND EVENT HANDLERS

  // Navigate back
  goBack() {
    this.navCtrl.back();
  }

  // Additional methods you might need:
  // - Method to handle real-time updates (websockets)
  // - Method to handle pagination/infinite scroll
  // - Method to handle message deletion
  // - Method to archive/unarchive conversations

  // Set up echo listeners for incoming messages
  private setupEchoListenersForUser(echo: Echo<any>, user: User): PusherPrivateChannel<any> {
    if (!echo) {
      console.error("Cannot setup listener: Echo is not available");
      return {} as PusherPrivateChannel<any>;
    }

    console.log("Setting up echo listeners for user", user);
    let channel = echo.private(`user.${user.id}.conversations`)
    channel.listen('ConversationUpdated', (e: Conversation) => {
      console.log("Received ConversationUpdated event", e)
      console.log("==>", JSON.stringify(e.latest_message))
      // update the conversation in the list
      let index = this.chats.findIndex(c => c.id === e.id);
      if (index !== -1) {
        this.chats[index] = e;
      } else {
        this.chats.unshift(e);
      }

      // Sort the conversations by updated_at
      this.chats.sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      this.applySearchFilter();
      this.cdr.detectChanges();

      // Only play sound if the only a new message
      // if (latestMessage && latestMessage.sender_id !== user.id) {
      if (this.chats[0]?.unread_count > 0) {
        this.playIncomingMessageAudio();
      }
    })
    return channel;


    /*return this.user$.pipe(
      map(user => {
        let channel = echo.private(`user.${user.id}.conversations`)
        
        return channel;
      })
    )*/
  }

  // Playing the sounds and vibrating the device
  playIncomingMessageAudio(){
    if (this.platform.is('capacitor')){
      NativeAudio.play({assetId: 'incoming-message.mp3'})
      Haptics.vibrate()
    } else {
      this.audio_incoming.play()
    }
  }

  environment = environment; // Expose the environment to the template
}