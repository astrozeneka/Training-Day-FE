// https://claude.ai/chat/9a73221d-d81b-437e-89ea-284ad16a3358

import { HttpClient, HttpHeaders, HttpResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { catchError, combineLatest, from, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ContentService } from '../content.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { ActionSheetController, IonContent } from '@ionic/angular';
import { User } from '../models/Interfaces';


interface Msg {
  id: number
  conversation_id: number
  sender_id: number
  sender_name: string
  content: string
  type: string
  status: string
  created_at: string
}

interface Conversation {
  id: number
}

@Component({
  selector: 'app-messenger-detail',
  styleUrls: ['./messenger-detail.page.scss'],
  template: `
  <ion-header class="chat-header">
    <ion-toolbar>
      <div class="header-container">
        <!-- Back button -->
        <ion-buttons slot="start">
          <ion-button class="back-button" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <!-- User info -->
        <div class="user-info-container">
          {{partnerId}}
        </div>
        <!--<div class="user-info-container user-details" *ngIf="chatPartner">
          <div class="avatar-container">
            <ion-avatar>
              <img [src]="chatPartner.avatar" alt="Profile picture">
            </ion-avatar>
            <div *ngIf="chatPartner.isOnline" class="online-indicator"></div>
          </div>
          <div class="user-text">
            <h6 class="user-name">{{chatPartner.name}}</h6>
            <p class="user-status">
              {{chatPartner.isOnline ? 'Online' : chatPartner.lastSeen ? 'Last seen ' + formatLastSeen(chatPartner.lastSeen) : 'Offline'}}
            </p>
          </div>-->
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class="chat-content" #content>
      <div class="main">
        <div class="discussion">
          <!-- Loading shimmer -->
          <div *ngIf="isLoading" class="loading-container">
            <div *ngFor="let i of [1,2,3,4,5]" class="loading-message" [ngClass]="{'right-aligned': i % 2 === 0}">
              <div [ngClass]="{'order-2': i % 2 === 0, 'order-1': i % 2 !== 0}" class="loading-avatar"></div>
              <div [ngClass]="{'order-1 right-margin': i % 2 === 0, 'order-2 left-margin': i % 2 !== 0}" class="loading-content">
                <div class="loading-header"></div>
                <div class="loading-body" [ngClass]="{'align-right': i % 2 === 0}" [ngStyle]="{'width': (40 + 0.5 * 40) + '%'}"></div>
                <div class="loading-footer" [ngClass]="{'align-right': i % 2 === 0}"></div>
              </div>
            </div>
          </div>

          <!-- Date separator -->
          <div *ngIf="!isLoading && messages.length > 0" class="date-separator">
            <div class="date-pill">
              <!--{{messages[0].timestamp | date:'MMM d, yyyy'}}-->1 Jan 1970
            </div>
          </div>

          <!-- Messages -->
          <div *ngIf="!isLoading" class="messages-container">
            <div *ngFor="let message of messages; let i = index" class="message-wrapper">
              <!-- New date separator -->
              <div *ngIf="i > 0 && shouldShowDateSeparator(message, messages[i-1])" class="date-separator">
                <div class="date-pill">
                  <!--{{message.timestamp | date:'MMM d, yyyy'}}-->1 Jan 1970
                </div>
              </div>

              <!-- Message bubble -->
              <div class="message" [ngClass]="{'sent': message.sender_id === currentUserId}">
                <!-- User avatar (only show for received messages) -->
                <div *ngIf="message.sender_id !== currentUserId" class="message-avatar">
                  <ion-avatar *ngIf="shouldShowAvatar(message, messages[i-1])">
                    <img [src]="chatPartner?.avatar" alt="Avatar">
                  </ion-avatar>
                </div>

                <!-- Message content -->
                <div class="message-content">
                  <!-- Attachments -->
                  <div *ngIf="message.attachments && message.attachments.length > 0" class="attachment-container">
                    <div *ngFor="let attachment of message.attachments">
                      <img *ngIf="attachment.type === 'image'" [src]="attachment.url" class="image-attachment">
                      <div *ngIf="attachment.type === 'file'" class="file-attachment">
                        <ion-icon name="document-outline" class="file-icon"></ion-icon>
                        <span class="file-name">{{attachment.name}}</span>
                      </div>
                      <div *ngIf="attachment.type === 'audio'" class="audio-attachment">
                        <ion-icon name="musical-note-outline" class="audio-icon"></ion-icon>
                        <span class="audio-label">Audio message</span>
                      </div>
                    </div>
                  </div>

                  <!-- Text message -->
                  <div *ngIf="message.content" class="message-bubble"
                    [ngClass]="message.sender_id === currentUserId ? 'sent-bubble' : 'received-bubble'">
                    <p class="message-text">{{message.content}}</p>
                  </div>

                  <!-- Timestamp and status -->
                  <div class="message-info" [ngClass]="message.sender_id === currentUserId ? 'align-right' : 'align-left'">
                    <span class="message-time"><!--{{message.timestamp | date:'shortTime'}}--></span>
                    <div *ngIf="message.sender_id === currentUserId" class="message-status">
                      <ion-icon *ngIf="message.status === 'sent'" name="checkmark-outline" class="status-icon sent"></ion-icon>
                      <ion-icon *ngIf="message.status === 'delivered'" name="checkmark-done-outline" class="status-icon delivered"></ion-icon>
                      <ion-icon *ngIf="message.status === 'read'" name="checkmark-done-outline" class="status-icon read"></ion-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scroll to bottom button -->
          <ion-fab vertical="bottom" horizontal="end" slot="fixed" *ngIf="showScrollToBottom">
            <ion-fab-button size="small" color="light" (click)="scrollToBottom()" class="scroll-button">
              <ion-icon name="arrow-down"></ion-icon>
            </ion-fab-button>
          </ion-fab>

          <!-- Empty chat state -->
          <div *ngIf="!isLoading && messages.length === 0" class="empty-chat">
            <ion-icon name="chatbubble-outline" class="empty-icon"></ion-icon>
            <p class="empty-title">No messages yet</p>
            <p class="empty-subtitle">Send a message to start the conversation</p>
          </div>
        </div>

        <!-- Message input area -->
        <div class="form">
          <div class="input-container">
            <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="message-form">
              <div class="form-content">
                <!-- Attachment button -->
                <ion-button fill="clear" class="attachment-button" (click)="openAttachmentOptions()">
                  <ion-icon name="add-circle-outline"></ion-icon>
                </ion-button>
                
                <!-- Message input -->
                <div class="input-field">
                  <input
                    type="text"
                    formControlName="message"
                    class="message-input"
                    placeholder="Type a message"
                    #messageInput
                  >
                  <!-- Emoji button -->
                  <ion-button fill="clear" class="emoji-button">
                    <ion-icon name="happy-outline"></ion-icon>
                  </ion-button>
                </div>
                
                <!-- Send button / Audio button -->
                <ion-button *ngIf="messageForm.get('message')?.value" fill="clear" type="submit" class="send-button">
                  <ion-icon name="send"></ion-icon>
                </ion-button>
                <ion-button *ngIf="!messageForm.get('message')?.value" fill="clear" class="mic-button" (click)="recordAudio()">
                  <ion-icon name="mic-outline"></ion-icon>
                </ion-button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ion-content>`
})
export class MessengerDetailPage implements OnInit {
  @ViewChild('content') content: IonContent | undefined;
  @ViewChild('messageInput') messageInput: ElementRef | undefined;

  // Form for message input
  messageForm: FormGroup;


  // The partner ID for the chat
  csrfCookie: any
  partnerId: number | undefined // <- This should be changed to a partner$ (for later)
  currentUserId: number | undefined = undefined;
  conversation$: Observable<Conversation> | undefined 

  chatPartner: User | undefined; // User (should be adapt following the correct data structure)
  messages: any[] = []; // <- Check if it should be MSG interface ???

  // UI state
  isLoading: boolean = true;
  showScrollToBottom: boolean = false;

  // To remove later
  lastMessage: string = ""

  // Pusher client and Echo instance
  // bearer token is required for registering the pusher client
  private bearerToken$: Observable<string>;
  pusherClient: Pusher | undefined;
  echo: Echo<any> | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private tokenExtractor: HttpXsrfTokenExtractor,
    private location: Location,
    private actionSheetCtrl: ActionSheetController,
    private cdr: ChangeDetectorRef,
  ) {
    // Initialize the message form
    this.messageForm = this.formBuilder.group({
      message: ['', []]
    });

    // The token$ is used to get the token from the content service
    this.bearerToken$ = from(this.contentService.storage.get('token')).pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    );

    // The user id is from the content service
    this.contentService.userStorageObservable.gso$().subscribe((user: any) => {
      this.currentUserId = user.id;
    })
  }

  ngOnInit() {
    this.isLoading = true;
    this.conversation$ = this.route.params.pipe(
      // 1. Get the partner ID
      tap(params => {
        this.partnerId = params['partnerId'];
      }),
      // 4. Open or fetch the conversation
      switchMap(() => this.createOrFetchConversation()),
      // 5. Cache the conversation
      shareReplay({ bufferSize: 1, refCount: true }) // Cache the latest emitted value
    );

    // Load the conversation from the backend
    combineLatest({
      token: this.bearerToken$!,
      convo: this.conversation$
    })
      .pipe(
        // 1. Fetch the messages
        switchMap(({ token, convo }) => {
          let headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
          });
          return this.http.get(`${environment.apiEndpoint}/msgs?conversation_id=${convo.id}`, {
            headers: headers
          })
        }),
        // Handle errors
        catchError(err => {
          console.error('Error fetching chat data:', err);
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((res:any)=>{
        console.log("Conversation loaded", res)
        this.isLoading = false;

        this.messages = res.msgs; // Not a good practice, must be updated later
        // Sort messages by id asc
        this.messages.sort((a: Msg, b: Msg) => a.id - b.id);
        
        this.scrollToBottom(true) // <- don't work
        this.cdr.detectChanges();
      })

    // Set up a chain of dependent operations
    this.route.params.pipe(
      // 2. Call /sanctum/csrf-cookie to get the CSRF token
      switchMap(() => this.fetchCsrfToken()),
      // 3. Initialize the pusher client
      switchMap(() => this.initializePusherClient()),
      // 5. Set up echo listeners for incoming messages
      tap(() => this.setupEchoListeners())
    )
      .subscribe(() => {
        console.log("OK")
      })
  }

  // Check if we should show date separator between messages
  // TODO later by using the created_at value
  // Is the Msg interface correct ?
  shouldShowDateSeparator(current: Msg, previous: Msg): boolean {
    if (!previous) return false;

    /*const currentDate = new Date(current.timestamp).setHours(0, 0, 0, 0);
    const previousDate = new Date(previous.timestamp).setHours(0, 0, 0, 0);

    return currentDate !== previousDate;*/
    return false; // TODO be updated later
  }

  // Determine if we should show the avatar for a message
  // todo later dependin gon the timestamp
  // Is the Msg interface correct ?
  shouldShowAvatar(current: Msg, previous: Msg): boolean {
    if (!previous) return true;
    if (current.sender_id !== previous.sender_id) return true;

    // If messages are more than 5 minutes apart, show avatar
    // const timeDiff = current.timestamp.getTime() - previous.timestamp.getTime();
    // return timeDiff > 300000; // 5 minutes in milliseconds
    return false; 
  }

  // Scroll to the bottom of the chat
  scrollToBottom(animate: boolean = true) {
    // This doesn't work since only the ion-content is scrollable
    // Should develop some code to allow a normal component to be programmatically scrollable
    console.log("Scrolling to bottom", (this.content as any).nativeElement.scrollToBottom);
    setTimeout(() => {
      this.content?.scrollToBottom(animate ? 300 : 0);
    }, 100);
  }

  // Call /sanctum/csrf-cookie to get the CSRF token
  private fetchCsrfToken(): Observable<any> {
    return this.bearerToken$.pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.get(`${environment.rootEndpoint}/sanctum/csrf-cookie`, { headers, observe: 'response' })
      }),
      tap(res => { console.log('CSRF token fetched:', res) }),
      catchError(err => {
        console.error("Error fetching CSRF token:", err);
        return of(null);
      })
    );
  }

  // Initialize the pusher client
  private initializePusherClient(): Observable<any> {
    return this.bearerToken$.pipe(
      map(token => {
        console.log("Initializing Pusher client with token");
        this.pusherClient = new Pusher('app-key', {
          cluster: 'eu',
          forceTLS: true,
          disableStats: true,
          wsHost: 'soketi.codecrane.me',
          wsPort: 443,
          enabledTransports: ['ws', 'wss'],
          // Add authorization for private channels
          authorizer: (channel: any, options: any) => {
            return {
              authorize: (socketId: string, callback: Function) => {
                console.log("CSRF-TOKEN", this.tokenExtractor.getToken())
                this.http.post(`${environment.rootEndpoint}/broadcasting/auth`, {
                  socket_id: socketId,
                  channel_name: channel.name
                }, {
                  headers: new HttpHeaders({
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': this.tokenExtractor.getToken() || ''
                  })
                }).subscribe({
                  next: (response: any) => callback(false, response),
                  error: (error: any) => callback(true, error)
                });
              }
            };
          }
        });
        this.echo = new Echo({
          broadcaster: 'pusher',
          client: this.pusherClient
        });
      })
    )
  }

  // Open or fetch the conversation by using /api/conversations
  private createOrFetchConversation(): Observable<any> {
    this.isLoading = true;
    return this.bearerToken$.pipe(
      switchMap((token) => {
        const header = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
        return this.http.post(`${environment.apiEndpoint}/conversations`, {
          'recipient_id': this.partnerId,
          'role': 'coach'
        }, {
          headers: header
        }).pipe(
          catchError(err => {
            console.error('Error fetching chat data:', err);
            return of([]);
          }),
          map((res: any) => {
            return res.conversation as Conversation; 
          })
        )
      })
    )
  }

  // Set up echo listeners for incoming messages
  private setupEchoListeners() {
    if (!this.echo) {
      console.error("Cannot setup listener: Echo not available");
      return;
    }

    this.conversation$!.pipe(
      tap(conversation => {
        this.echo?.private(`conversation.${conversation.id}`)
        .listen('MessageSent', (e: Msg) => {
          this.lastMessage = e.content
          console.log("Message received", e)
        })
      }))
      .subscribe()
  }

  // Send a message
  sendMessage() {
    const messageText = this.messageForm.get('message')?.value;
    if (!messageText || messageText.trim() === '') return;


    this.conversation$!.pipe(
      switchMap((conversation) => {
        return this.contentService.post('/msgs', { // Use the http instead of contentService if possible to avoid future issues
          'conversation_id': conversation.id,
          'content': messageText,
          'type': 'text', // Todo be updated later
          'role': 'coach' // Can be nutritionist or coach
        })
      }),
      catchError((err) => {
        console.error('Error sending message:', err);
        return throwError(() => err)
      })
    )
      .subscribe((res) => {
        console.log("ok", res)  
      })
  }

  // Open attachment options
  async openAttachmentOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Attachments',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            // Implement camera functionality
          }
        },
        {
          text: 'Photo & Video Library',
          icon: 'image-outline',
          handler: () => {
            // Implement photo library access
          }
        },
        {
          text: 'Document',
          icon: 'document-outline',
          handler: () => {
            // Implement document picker
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // Record audio message
  recordAudio() {
    // Implement audio recording functionality
    console.log('Recording audio...');
  }

  // Open message options
  async openOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Chat Options',
      buttons: [
        {
          text: 'View Contact',
          icon: 'person-outline',
          handler: () => {
            // Implement view contact
          }
        },
        {
          text: 'Media, links, and docs',
          icon: 'images-outline',
          handler: () => {
            // Implement media gallery
          }
        },
        {
          text: 'Search',
          icon: 'search-outline',
          handler: () => {
            // Implement search
          }
        },
        {
          text: 'Mute Notifications',
          icon: 'notifications-off-outline',
          handler: () => {
            // Implement mute
          }
        },
        {
          text: 'Clear Chat',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            // Implement clear chat
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  goBack() {
    // Navigate back to the previous page
    this.location.back();
  }
}
