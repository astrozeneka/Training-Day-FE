// https://claude.ai/chat/9a73221d-d81b-437e-89ea-284ad16a3358

import { HttpClient, HttpHeaders, HttpResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { catchError, from, of, switchMap, throwError } from 'rxjs';
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
  }

  ngOnInit() {

    // Get the chat ID from route params
    this.route.params.subscribe(params => {
      console.log("Partner id", params['partnerId'])
      this.partnerId = params['partnerId'];
      this.loadChatData();
    });

    // Initialize the pusher client (require the token from the content service)
    // This portion of the code should be moved to a service (ask Claude)
    this.contentService.storage.get('token').then((token) => {
      console.log("Tokens", token)
      setTimeout(() => { // TODO, the below code should wait for the csrf-token to be set first (the related code is below)
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
        console.log("Initializing pusher client")
        this.echo = new Echo({
          broadcaster: 'pusher',
          client: this.pusherClient
        });
      }, 3000)
    })

    // Get the csrf token from the server
    this.contentService.storage.get('token').then((token) => {
      let headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
      this.http.get(`${environment.rootEndpoint}/sanctum/csrf-cookie`, { withCredentials: true, headers, observe: 'response' }).subscribe((res: HttpResponse<any>) => {
        console.log(res)
      })
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

  // DATA HANDLING
  // For later, move this to a service (ask claude)
  pusherClient: Pusher | undefined;
  echo: Echo<any> | undefined;

  // Load chat data
  private loadChatData() {

    // THe two code below should be correctly merged (consult with Claude)

    // The contentService is quite 'badly' managed, so independently fetching the token is better
    this.contentService.storage.get('token').then((token) => {
      let header = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
      // For a real app, you would fetch this data from a service
      this.isLoading = true;
      from(of([])) // It should be replaced by a real API call to fetch the chat data
        .pipe(switchMap(() => {
          this.isLoading = false;
          return this.http.post(`${environment.apiEndpoint}/conversations`, {
            'recipient_id': this.partnerId,
            'role': 'coach'
          }, {
            headers: header
          }).pipe(
            catchError(err => {
              console.error('Error fetching chat data:', err);
              this.isLoading = false;
              return of([]);
            })
          )
        }))
        .subscribe((res: any) => {
          console.log("Conversation opened", res)
          this.conversationId = res.conversation?.id
          this.isLoading = false;
        });
    })


    // Managing the realtime communication with the server
    setTimeout(() => { // Normally, should use observable to manage readyness (Ask Claude) // Also wait for conversationId
      let channel = this.echo?.private(`conversation.${this.conversationId}`)
        .listen('MessageSent', (e: Msg) => {
          this.lastMessage = e.content
          console.log("Message received", e)
        })
    }, 5000)
  }
}
