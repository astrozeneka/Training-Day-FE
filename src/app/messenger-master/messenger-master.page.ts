import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActionSheetController, IonContent, IonSearchbar, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { User } from '../models/Interfaces';
import { Conversation, Msg } from '../messenger-interfaces';
import { BehaviorSubject, catchError, combineLatest, from, map, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../content.service';
import { HttpClient } from '@angular/common/http';
import { MessengerService } from '../messenger.service';
import { environment } from 'src/environments/environment';
import Echo from 'laravel-echo';
import { PusherPrivateChannel } from 'laravel-echo/dist/channel';

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
    <!-- Status & Availability Section -->
    <div class="availability-section" *ngIf="staffMenuAvailable">
      <div class="availability-container">
        <div class="status-indicator">
          <ion-badge class="status-badge {{isAvailable ? 'available' : 'unavailable'}}">
            {{isAvailable ? 'Disponible' : 'Non disponible'}}
          </ion-badge>
        </div>
        <div class="toggle-container">
          <span class="toggle-label">Je suis disponible</span>
          <ion-toggle [checked]="isAvailable" (ionChange)="toggleAvailability($event)" color="success"></ion-toggle>
        </div>
      </div>
    </div>

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
        {{ filteredChats.length }} 
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
        <div class="empty-state">
          <ion-icon name="chatbubbles-outline" class="empty-icon"></ion-icon>
          <h3 class="empty-title">Aucune conversation</h3>
          <p class="empty-subtitle">
            {{searchQuery ? 'Aucun résultat trouvé pour "' + searchQuery + '"' : 'Vous n\'avez pas encore de conversations'}}
          </p>
        </div>
      </ng-template>
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

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private formBuilder: FormBuilder,
    private contentService: ContentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private messengerService: MessengerService,
    private router: Router
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

    this.bearerToken$?.subscribe(token => {
      let headers = {
        'Authorization': `Bearer ${token}`
      }
      this.http.get(`${environment.apiEndpoint}/conversations`, { headers })
        .pipe(
          // Handle errors
          catchError(err => {
            console.error('Error fetching chat data:', err);
            // this.isLoading = false;
            // return of([]);
            return throwError(()=>err);
          })
        )
        .subscribe((res: any) => {
          let success = res.success as boolean;
          let conversations = res.conversations as Conversation[];
          this.chats = conversations;
          this.applySearchFilter();
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log("Conversation loaded, data: ", res);
        })
    })

    // Setup the listener
    combineLatest({
      user: this.user$,
      echo: this.messengerService.echo$
    }).pipe(
      map(({user, echo}) => this.setupEchoListenersForUser(echo, user))
    )
      .subscribe()
  }

  // Load chat data - in a real app, this would be a service call
  loadChatData() {
    // This is sample data - you would normally fetch this from an API
    this.chats = [
      /*{
        id: 6,
        name: 'Coach Coach',
        avatar: '../../../assets/samples/profile-sample-1.jpg',
        lastMessage: 'Bonjour, comment allez-vous aujourd\'hui?',
        timestamp: '10:23',
        unreadCount: 2
      },
      {
        id: 7,
        name: 'Ryan Rasoarahona',
        avatar: '../../../assets/samples/profile-sample-1.jpg',
        lastMessage: 'J\'ai terminé mon entraînement d\'aujourd\'hui!',
        timestamp: '09:15',
        unreadCount: 0
      },
      {
        id: 15,
        name: 'John Doe',
        avatar: '../../../assets/samples/profile-sample-1.jpg',
        lastMessage: 'Merci pour votre aide, à bientôt!',
        timestamp: 'Hier',
        unreadCount: 0
      },*/
      // Add more sample data as needed
    ];

    // this.filteredChats = [...this.chats];
  }

  toggleAvailability(event: CustomEvent|any) {
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
    }, 500);
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
  private setupEchoListenersForUser(echo: Echo<any>, user: User):PusherPrivateChannel<any> {
    if (!echo) {
      console.error("Cannot setup listener: Echo is not available");
      return {} as PusherPrivateChannel<any>;
    }

    console.log("Setting up echo listeners for user", user);
    let channel = echo.private(`user.${user.id}.conversations`)
    channel.listen('ConversationUpdated', (e: Conversation) => {
      console.log("Received ConversationUpdated event", e)
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
    })
    return channel;


    /*return this.user$.pipe(
      map(user => {
        let channel = echo.private(`user.${user.id}.conversations`)
        
        return channel;
      })
    )*/
  }
}