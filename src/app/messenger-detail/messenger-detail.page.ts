// https://claude.ai/chat/9a73221d-d81b-437e-89ea-284ad16a3358

import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { catchError, combineLatest, filter, from, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ContentService } from '../content.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { ActionSheetController, IonContent, Platform } from '@ionic/angular';
import { User } from '../models/Interfaces';
import { MessengerService } from '../messenger.service';
import PrivateChannel from 'pusher-js/types/src/core/channels/private_channel';
import { PusherPrivateChannel } from 'laravel-echo/dist/channel';
import { Msg, PresignedUrlRequestResult } from '../messenger-interfaces';
import { MsgAttachmentService } from '../msg-attachment.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { FeedbackService } from '../feedback.service';
import { Browser } from '@capacitor/browser';



interface Conversation {
  id: number,
  name: string
}

interface File {
  name: any,
  type: string,
  blob: any
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
          {{ conversationTitle }}
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

          <!-- Date separator at the beginning -->
          <div *ngIf="!isLoading && messages.length > 0" class="date-separator">
            <div class="date-pill">
              {{messages[0].created_at | date:'MMM d, yyyy'}}
            </div>
          </div>

          <!-- Add this after the date separator and before the messages container -->
          <div *ngIf="isLoadingMore" class="loading-more">
            <ion-spinner name="dots"></ion-spinner>
            <span>Loading more messages...</span>
          </div>

          <!-- Messages -->
          <div *ngIf="!isLoading" class="messages-container">
            <div *ngFor="let message of messages; let i = index" class="message-wrapper">
              <!-- New date separator within message list -->
              <div *ngIf="i > 0 && shouldShowDateSeparator(message, messages[i-1])" class="date-separator">
                <div class="date-pill">
                  {{message.created_at | date:'MMM d, yyyy'}}
                </div>
              </div>

              <!-- Message bubble -->
              <div class="message" [ngClass]="{'sent': message.sender_id === currentUserId}">
                <!-- User avatar (only show for received messages) -->
                <div *ngIf="message.sender_id !== currentUserId" class="message-avatar">
                  <ion-avatar *ngIf="shouldShowAvatar(message, messages[i-1])">
                    <img [src]="chatPartner?.avatar" alt="Avatar" *ngIf="chatPartner?.avatar">
                    <img src="../../../assets/samples/profile-sample-1.jpg" alt="Avatar" *ngIf="!chatPartner?.avatar">
                  </ion-avatar>
                  <div *ngIf="!shouldShowAvatar(message, messages[i-1])" class="placeholder"></div>
                </div>

                <!-- Message content -->
                <div class="message-content">
                  <!-- Attachments - Modified to use message.type directly -->
                  <div *ngIf="message.type === 'file' || message.type === 'image'" class="attachment-container" (click)="openAwsResource(message.content)">
                    <!-- Image attachment -->
                    <img *ngIf="isImageUrl(message.content)" [src]="message.content" class="image-attachment">
                    
                    <!-- File attachment -->
                    <div *ngIf="message.type === 'file' && !isImageUrl(message.content)" class="file-attachment">
                      <ion-icon name="document-outline" class="file-icon"></ion-icon>
                      <span class="file-name">{{extractFilename(message.content)}}</span>
                    </div>
                  </div>

                  <!-- Text message - Only show text bubble for 'text' type messages -->
                  <div *ngIf="message.type === 'text' && message.content" class="message-bubble"
                    [ngClass]="message.sender_id === currentUserId ? 'sent-bubble' : 'received-bubble'">
                    <p class="message-text">{{message.content}}</p>
                  </div>

                  <!-- Timestamp and status -->
                  <div class="message-info" [ngClass]="message.sender_id === currentUserId ? 'align-right' : 'align-left'">
                    <span class="message-time"><!--{{message.timestamp | date:'shortTime'}}--></span>
                    <div *ngIf="message.sender_id === currentUserId" class="message-status">
                      <div *ngIf="message.status === 'sending'" class="sending-indicator">
                        <div class="sending-container">
                          <div class="sending-text">Envoi en cours</div>
                          <div class="sending-dots">...</div>
                        </div>
                      </div>
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
            <p class="empty-title">Pas de messages pour l'instant</p>
            <p class="empty-subtitle">Envoyez un message pour commencer à discuter</p>
          </div>
        </div>
      </div>
    </ion-content>
    <ion-footer>
      <!-- Upload progress indicator -->
      <div class="upload-progress-container" *ngIf="isUploading">
        <div class="upload-progress-info">
          <ion-icon name="document-outline"></ion-icon>
          <div class="upload-text">
            <div class="file-name">{{uploadingFileName}}</div>
            <div class="progress-text">Uploading: {{uploadProgress}}%</div>
          </div>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" [style.width.%]="uploadProgress"></div>
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
                <input type="file" #attachmentFileInput class="ion-hide" accept="*" (change)="attachmentFileInputChanged($event)">

                <!-- Message input -->
                <div class="input-field">
                  <input
                    type="text"
                    formControlName="message"
                    class="message-input"
                    placeholder="Type a message"
                    #messageInput
                  >
                </div>
                
                <!-- Send button / Audio button -->
                <ion-button fill="clear" type="submit" class="send-button">
                  <ion-icon name="send"></ion-icon>
                </ion-button>
              </div>
            </form>
          </div>
        </div>
    </ion-footer>
    `
})
export class MessengerDetailPage implements OnInit {
  @ViewChild('content') content: IonContent | undefined;
  @ViewChild('messageInput') messageInput: ElementRef | undefined;

  // Form for message input
  messageForm: FormGroup;


  // The partner ID for the chat
  csrfCookie: any
  // partnerId: number | undefined // <- This should be changed to a partner$ (for later)
  conversationId: number
  currentUserId: number | undefined = undefined;
  conversation$: Observable<Conversation> | undefined 

  chatPartner: User | undefined; // User (should be adapt following the correct data structure)
  messages: any[] = []; // <- Check if it should be MSG interface ???

  // UI state
  isLoading: boolean = true;
  showScrollToBottom: boolean = false;

  // To remove later
  lastMessage: string = ""
  conversationTitle: string = ""

  // Pusher client and Echo instance
  // bearer token is required for registering the pusher client
  private bearerToken$: Observable<string>;

  // Required for attachment uploads
  @ViewChild('attachmentFileInput') attachmentFileInput: any = undefined; // Used for testing on desktop
  uploadProgress: number = 0;
  isUploading: boolean = false;
  uploadingFileName: string = '';

  // Required for the scroll loading
  hasMore: boolean = true;
  oldestMessageId: number | null = null;
  isLoadingMore: boolean = false;



  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private tokenExtractor: HttpXsrfTokenExtractor,
    private location: Location,
    private actionSheetCtrl: ActionSheetController,
    private cdr: ChangeDetectorRef,
    private messengerService: MessengerService,
    private attachmentService: MsgAttachmentService,
    private platform: Platform,
    private feedbackService: FeedbackService
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
        this.conversationId = params['conversationId'];
      }),
      // 4. Open or fetch the conversation
      switchMap(() => this.createOrFetchConversation()),
      // 4. Tap the conversation name
      tap((convo: Conversation) => {
        this.conversationTitle = convo.name || 'Sans titre';
        console.log(this.conversationTitle)
      }),
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

        // The pagination properties
        this.oldestMessageId = res.oldest_message_id;
        this.hasMore = res.has_more;
        
        this.scrollToBottom(true)
        this.cdr.detectChanges();
      })

    
    combineLatest({
      convo: this.conversation$,
      echo: this.messengerService.echo$
    })
      .pipe(map(({ convo, echo }) => {
        return this.setupEchoListenersForConversation(echo, convo);
      }))
      .subscribe(channel => null);
  }

  // Check if we should show date separator between messages
  // TODO later by using the created_at value
  // Is the Msg interface correct ?
  shouldShowDateSeparator(current: Msg, previous: Msg): boolean {
    if (!previous) return false;

    const currentDate = new Date(current.created_at).setHours(0, 0, 0, 0);
    const previousDate = new Date(previous.created_at).setHours(0, 0, 0, 0);

    return currentDate !== previousDate;
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
    setTimeout(() => {
      console.log("Scrolling to bottom", this.content)
      this.content?.scrollToBottom(animate ? 300 : 0);
    }, 100);
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
          'conversation_id': this.conversationId
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
  private setupEchoListenersForConversation(echo: Echo<any>, conversation: Conversation):PusherPrivateChannel<any> {
    let channel = echo.private(`conversation.${conversation.id}`);
    channel.listen('MessageSent', (e: Msg) => {
      this.lastMessage = e.content
      console.log("Message received", e)

      // Check if the message is already added as a 'sending' message
      const tempIndex = this.messages.findIndex(m => 
        m.sender_id === e.sender_id &&
        m.status === 'sending' &&
        m.content === e.content);
      // If yes, replace
      if (tempIndex !== -1) {
        this.messages[tempIndex] = e;
      } else { // Otherwise, add the message
        this.messages.push(e);
      }

      // Play sound here (TODO)
      this.messages.sort((a: Msg, b: Msg) => a.id - b.id);
      this.cdr.detectChanges();

      // Scroll to the bottom
      this.scrollToBottom();
    })
    return channel
  }

  // Send a message
  sendMessage() {
    const messageText = this.messageForm.get('message')?.value;
    if (!messageText || messageText.trim() === '') return;

    // Clear the input field
    this.messageForm.get('message')?.setValue('');

    // Temporary message with 'sending' status
    const tempMessage: Msg = {
      id: Date.now(), // Temporary ID
      conversation_id: this.conversationId,
      sender_id: this.currentUserId!,
      sender_name: 'Vous',
      content: messageText,
      type: 'text',
      status: 'sending', // Temporary status
      created_at: new Date().toISOString()
    };
    this.messages.push(tempMessage);
    // Scroll to the bottom
    this.scrollToBottom();

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
      })
  }

  // Open attachment options
  async openAttachmentOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Attachments',
      buttons: [
        {
          text: 'Images',
          handler: () => {
            this.triggerAttachmentUpload('image');
          }
        },
        {
          text: 'Videos',
          handler: () => {
            this.triggerAttachmentUpload('video');
          }
        },
        {
          text: 'Document',
          handler: () => {
            this.triggerAttachmentUpload('file');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  attachmentFileInputChanged(event: any){
    // used only for testing on desktop
    let fileObj = event.target.files[0];
    if (!fileObj) return;

    from(new Promise<File>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const fileData = reader.result;
          let blob = this.dataUriToBlob(fileData as string);
          resolve({
            name: fileObj.name,
            type: fileObj.type,
            blob: blob
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(fileObj);
    }))
    .pipe(
      switchMap(file => this.processSelectedFile(file as File)),
    )
    .subscribe()
  }

  triggerAttachmentUpload(type: 'image' | 'video' | 'file') {
    if (this.platform.is('capacitor')) {
      // On mobile
      from(this.capacitorPickMedia(type)).pipe(
        filter(file => file !== null),
        switchMap(file => this.processSelectedFile(file as File))
      )
        .subscribe()
    } else {
      // On desktop
      this.attachmentFileInput.nativeElement.click();
    }
  }

  private processSelectedFile(file: File): Observable<any> {
    return this.attachmentService.getPresignedUrl(file.name, file.type).pipe(
      tap(res => {
        if (!res.success) {
          this.feedbackService.registerNow('Erreur lors de la récupération de l\'URL de pré-signature', 'danger');
          throw new Error('Failed to get presigned URL');
        }
      }),
      switchMap((res: PresignedUrlRequestResult) => {
        return this.uploadToS3(file, res)
      }),
      switchMap(({response, pur}: {response: any, pur: PresignedUrlRequestResult}) => {

        // Temporary message with 'sending' status
        const tempMessage: Msg = {
          id: Date.now(), // Temporary ID
          conversation_id: this.conversationId,
          sender_id: this.currentUserId!,
          sender_name: 'Vous',
          content: pur.file_url,
          type: 'file', // Todo be updated later
          status: 'sending', // Temporary status
          created_at: new Date().toISOString()
        };
        this.messages.push(tempMessage);
        // Scroll to the bottom
        this.scrollToBottom();
        this.cdr.detectChanges();

        // TODO here, prepare the message and send to the server
        let msgObject = {
          'conversation_id': this.conversationId,
          'content': pur.file_url,
          'type': 'file', // TOdo, it might be image as well
        }
        return this.contentService.post('/msgs', msgObject)
      }),
      catchError((err) => {
        console.error('Error sending message:', err);
        return throwError(() => err)
      })
    )
  }

  private uploadToS3(file:File, pur: PresignedUrlRequestResult): Observable<{response: HttpResponse<any>, pur: PresignedUrlRequestResult}> {
    const formData = new FormData();
    formData.append('file', file.blob, file.name);
    const req = new HttpRequest('PUT', pur.upload_url, file.blob, {
      headers: new HttpHeaders({
        'Content-Type': file.type
      }),
      reportProgress: true,
    });
    return this.http.request(req)
      .pipe(
        catchError((error) => {
          // Return 403, here
          console.error('Error uploading file:', error);
          // this.isFormLoading = false
          return throwError(()=>error);
        }),
        tap(event => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress = progress;
            this.uploadingFileName = file.name;
            this.isUploading = true; // Uncomment this line
            console.log("Progress: " + progress + "%");
          } else if (event.type === HttpEventType.Response) {
            console.log("Upload complete", event);
            this.isUploading = false; // Add this line to reset the state when upload is complete
          }
        }),
        filter(event => event instanceof HttpResponse),
        map(event => event as HttpResponse<any>),
        catchError((error) => {
          console.log('Error uploading file:', error);
          //this.isUploading = false;
          return throwError(() => error);
        }),
        map(response => ({
          response,
          pur
        }))
      )
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

  async capacitorPickMedia(type: 'image' | 'video' | 'file') {
    try {
      let result;
      if (type === 'image') {
        result = await FilePicker.pickImages({
          limit: 1,
          readData: true,
          skipTranscoding: false
        });
      } else if (type === 'video') {
        result = await FilePicker.pickVideos({
          limit: 1,
          readData: true
        });
      } else if (type === 'file') {
        result = await FilePicker.pickFiles({
          limit: 1,
          readData: true
        });
      }

      if (result.files && result.files.length > 0) {
        let fileData = result['files'][0]
        let previewUrl = `data:${fileData.mimeType};base64,${fileData.data}`;
        let file = {
          name: fileData.name,
          type: fileData.mimeType,
          blob: this.dataUriToBlob(previewUrl)
        }
        return file;
        /*
        // For debugging
        console.log("Preview Url " + previewUrl.substring(0, 100) + "...");
        console.log("File " + JSON.stringify(file).substring(0, 100) + "...");
        let blobSize = file.blob.size;
        console.log("Blob size: " + blobSize);
        */
      } else {
        console.log("No file selected");
        return null;
      }
    } catch (e) {
      console.error("Error picking media", e);
      return null;
    }
  }

  goBack() {
    // Navigate back to the previous page
    this.location.back();
  }/**
   * https://github.com/the-vv/college-notifier-app/blob/36a17186a0865fba01669fea2da70ac44e86a5d4/src/app/shared/file-upload/file-upload.component.ts#L122
   * @param dataURI 
   * @returns 
   */

  private dataUriToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',');
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  // Check if URL is an image
  isImageUrl(url: string): boolean {
    if (!url) return false;
    
    // Check if URL ends with common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowercaseUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowercaseUrl.endsWith(ext)) || 
          (lowercaseUrl.includes('_') && imageExtensions.some(ext => lowercaseUrl.includes(ext)));
  }

  // Extract filename from URL
  extractFilename(url: string): string {
    if (!url) return 'File';
    
    try {
      // Get the file name from the URL path
      const urlParts = new URL(url).pathname.split('/');
      let filename = urlParts[urlParts.length - 1];
      
      // Decode URI components to handle spaces and special characters
      filename = decodeURIComponent(filename);
      
      return filename;
    } catch (e) {
      // If URL parsing fails, use a basic approach
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1] || 'File';
    }
  }

  // Open aws resources
  openAwsResource(url: string) {
    if (this.platform.is('capacitor')) {
      // Open the URL using Capacitor's Browser API
      Browser.open({
        url: url,
        windowName: '_blank',
        toolbarColor: '#ffffff',
        presentationStyle: 'popover'
      });
    } else {
      // Open the URL in a new tab for web
      window.open(url, '_blank');
    }
  }

  loadMoreMessages() {
    if (!this.hasMore || this.isLoadingMore || !this.oldestMessageId) return;
    this.isLoadingMore = true;

    combineLatest({
      token: this.bearerToken$!,
      convo: this.conversation$
    }).pipe(
      switchMap(({ token, convo }) => {
        let headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.get(`${environment.apiEndpoint}/msgs?conversation_id=${convo.id}&before_id=${this.oldestMessageId}&limit=20`, {
          headers: headers}); 
      }),
      catchError(err => {
        console.error('Error fetching more messages:', err);
        this.isLoadingMore = false;
        return of({success: false, msgs: []});
      })
    ).subscribe((res:any)=>{
      this.isLoadingMore = false;

      if (res.success && res.msgs && res.msgs.length > 0) {
        // Sort messages in ascending order by ID since we're prepending
        res.msgs.sort((a: Msg, b: Msg) => a.id - b.id);
        this.messages = [...res.msgs, ...this.messages]; // Prepend new messages
        this.oldestMessageId = res.oldest_message_id;
        this.hasMore = res.has_more === true;
      } else {
        this.hasMore = false;
      }
      this.cdr.detectChanges();
    })
      
  }

  private scrollElement: HTMLElement | null = null;
  ngAfterViewInit() {
    // Get the scroll element after view is initialized
    this.content?.getScrollElement().then((element) => {
      this.scrollElement = element;
      // Add the scroll event listener manually
      this.scrollElement.addEventListener('scroll', (event) => {
        const scrollTop = this.scrollElement?.scrollTop || 0;
        // Only load more if we're near the top, have more messages, and aren't loading
        if (scrollTop < 200 && this.hasMore && !this.isLoadingMore && this.oldestMessageId) {
          console.log('Loading more messages...');
          this.loadMoreMessages();
        }
      });
    })
  }
}
