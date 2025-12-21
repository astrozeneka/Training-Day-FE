import { Injectable } from '@angular/core';
import { from, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { ContentService } from './content.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Clear sepearation of concerns
  private isUserConnected$: Observable<boolean>;
  private bearerToken$: Observable<string>;

  constructor(
    private contentService: ContentService,
    private http: HttpClient
  ) {
    // gso$ is a hot observable (share the same execution)
    this.isUserConnected$ = this.contentService.userStorageObservable.gso$()
      .pipe(
        map((user) => !!user),
        shareReplay(1)
      );

    this.bearerToken$ = this.isUserConnected$.pipe(
      switchMap((isConnected) => {
        if (isConnected) {
          return from(this.contentService.storage.get('token'))
        } else {
          return of(''); // from([null]) might work as well
        }
      }),
      shareReplay(1)
    )
  }

  httpGet(url: string): Observable<any> {
    // Return a cold observable
    return this.bearerToken$.pipe(
      take(1),
      switchMap((token) => {
        const headers = {};
        if (token) {
          (headers as any)['Authorization'] = `Bearer ${token}`;
        }
        return this.http.get(url, { headers });
      })
    );
  }
}
