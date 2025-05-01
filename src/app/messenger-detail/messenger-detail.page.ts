// https://claude.ai/chat/9a73221d-d81b-437e-89ea-284ad16a3358

import { HttpClient, HttpHeaders, HttpResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { catchError, from, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ContentService } from '../content.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

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

@Component({
  selector: 'app-messenger-detail',
  template: `<ion-content>
    <h1>Messenger Detail</h1>
    <div>Last message: {{ lastMessage }}</div>
    <!-- Message input area -->
    <div class="border-t border-gray-200">
      <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="p-2">
        <div class="flex items-center">
          <!-- Attachment button -->
          <ion-button fill="clear" class="h-10 text-gray-500" (click)="openAttachmentOptions()">
            <ion-icon name="add-circle-outline" class="text-xl"></ion-icon>
          </ion-button>
          
          <!-- Message input -->
          <div class="flex-1 mx-2 bg-gray-100 rounded-full p-1 pl-4 flex items-center">
            <input
              type="text"
              formControlName="message"
              class="flex-1 bg-transparent text-gray-800 text-sm focus:outline-none"
              placeholder="Type a message"
              #messageInput
            >
            <!-- Emoji button -->
            <ion-button fill="clear" class="h-8 w-8 text-gray-500">
              <ion-icon name="happy-outline" class="text-xl"></ion-icon>
            </ion-button>
          </div>
          
          <!-- Send button / Audio button -->
          <ion-button *ngIf="messageForm.get('message')?.value" fill="clear" type="submit" class="h-10 text-blue-500">
            <ion-icon name="send" class="text-xl"></ion-icon>
          </ion-button>
          <!--<ion-button *ngIf="!messageForm.get('message')?.value" fill="clear" class="h-10 text-gray-500" (click)="recordAudio()">
            <ion-icon name="mic-outline" class="text-xl"></ion-icon>
          </ion-button>-->
        </div>
      </form>
    </div>
    </ion-content>`
})
export class MessengerDetailPage implements OnInit {

  // Form for message input
  messageForm: FormGroup;


  // The partner ID for the chat
  csrfCookie: any
  partnerId: number | undefined
  conversationId: number | undefined


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
    private tokenExtractor: HttpXsrfTokenExtractor
  ) {
    // Initialize the message form
    this.messageForm = this.formBuilder.group({
      message: ['', []]
    });

    // The token$ is used to get the token from the content service
    this.bearerToken$ = from(this.contentService.storage.get('token')).pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    );
  }

  ngOnInit() {
    // Set up a chain of dependent operations

    // Get the chat ID from route params
    this.route.params.pipe(
      // 1. Get the partner ID
      tap(params => {
        console.log("Partner id", params['partnerId'])
        this.partnerId = params['partnerId'];
      }),
      // 2. Call /sanctum/csrf-cookie to get the CSRF token
      switchMap(() => this.fetchCsrfToken()),
      // 3. Initialize the pusher client
      switchMap(() => this.initializePusherClient()),
      // 4. Open or fetch the conversation
      switchMap(() => this.createOrFetchConversation()),
      // 5. Set up echo listeners for incoming messages
      tap(() => this.setupEchoListeners())
    )
      .subscribe(()=>{
        console.log("OK")
      })
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
      tap(res => {console.log('CSRF token fetched:', res) }),
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
          tap((res: any) => {
            this.conversationId = res.conversation?.id
            this.isLoading = false;
          }),
          catchError(err => {
            console.error('Error fetching chat data:', err);
            this.isLoading = false;
            return of([]);
          })
        )
      })
    )
  }

  // Set up echo listeners for incoming messages
  private setupEchoListeners() {
    if (!this.echo || !this.conversationId) {
      console.error("Cannot setup listener: Echo or conversationId not available");
      return;
    }

    let channel = this.echo?.private(`conversation.${this.conversationId}`)
      .listen('MessageSent', (e: Msg) => {
        this.lastMessage = e.content
        console.log("Message received", e)
      })
  }

  sendMessage() {
    const messageText = this.messageForm.get('message')?.value;
    if (!messageText || messageText.trim() === '') return;

    this.contentService.post('/messages', {
      'conversation_id': this.conversationId,
      'content': messageText,
      'type': 'text', // Todo be updated later
      'role': 'coach' // Can be nutritionist or coach
    })
      .pipe(catchError((err) => {
        console.error('Error sending message:', err);
        return throwError(() => err)
      }))
      .subscribe((res) => {
        console.log("Ok", res)
      })

  }

  // Open attachment options
  async openAttachmentOptions() {
    // To manage later
  }

  // To be merged with the UI
  isLoading: boolean = false; // USed with the shimmering loader
}
