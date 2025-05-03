import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { catchError, combineLatest, from, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { ContentService } from './content.service';
import { HttpClient, HttpHeaders, HttpXsrfTokenExtractor } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {

  private bearerToken$: Observable<string>;
  private csrfTokenReady$: Observable<any>;
  private pusherClient$: Observable<Pusher>;
  public echo$: Observable<Echo<any>>;

  constructor(
    private contentService: ContentService,
    private http: HttpClient,
    private tokenExtractor: HttpXsrfTokenExtractor,
  ) { 

    // The token$ is used to get the token from the content service
    this.bearerToken$ = from(this.contentService.storage.get('token')).pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    );

    // An observable to ensure that the CSRF token is fetched before making any requests
    this.csrfTokenReady$ = this.fetchCsrfToken().pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    )

    // Initialize the pusher client
    this.pusherClient$ = this.initializePusherClient().pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    )

    // Initialize the echo client with the pusher client
    this.echo$ = this.pusherClient$.pipe(
      switchMap(pusherClient => this.initializeEcho(pusherClient)),
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    );
  }
  
  // Call /sanctum/csrf-cookie to get the CSRF token
  private fetchCsrfToken(): Observable<any> {
    return this.bearerToken$!.pipe(
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
    return combineLatest({
      bearerToken: this.bearerToken$!,
      csrfTokenReady: this.csrfTokenReady$
    })
      .pipe(
        map(({ bearerToken }) => {
          return new Pusher('app-key', {
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
                      'Authorization': `Bearer ${bearerToken}`,
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
        })
      )
  }

  // Initialize the echo client with the pusher client
  private initializeEcho(pusherClient: Pusher): Observable<Echo<any>> {
    return from(new Promise<Echo<any>>((resolve) => {
      resolve(new Echo({
        broadcaster: 'pusher',
        client: pusherClient,
      }));
    }));
  }

}
