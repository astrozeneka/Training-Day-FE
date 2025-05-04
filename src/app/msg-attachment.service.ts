import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ContentService } from './content.service';
import { PresignedUrlRequestResult } from './messenger-interfaces';

@Injectable({
  providedIn: 'root'
})
export class MsgAttachmentService {
  private bearerToken$: Observable<string>;

  constructor(
    private http: HttpClient,
    private contentService: ContentService
  ) {
    // The token$ is used to get the token from the content service
    this.bearerToken$ = from(this.contentService.storage.get('token')).pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    );
  }

  /**
   * Get presigned URL for file upload
   */
  getPresignedUrl(fileName: string, fileType: string): Observable<PresignedUrlRequestResult> {
    return this.bearerToken$.pipe(
      switchMap(token => {
        let header = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.get(`${environment.apiEndpoint}/msgs/generate-attachment-presigned-url?file_name=${fileName}&file_type=${fileType}`, { headers: header })
          .pipe(catchError(error => {
            console.error('Error getting presigned URL:', error);
            return throwError(() => error);
          })) as Observable<PresignedUrlRequestResult>;
      }))
  }

  /**
   * Upload file to S3 using presigned URL
   */
  uploadFileToS3(presignedUrl: string, file: File, fileType: string): Observable<any> {
    const req = new HttpRequest('PUT', presignedUrl, file, {
      headers: new HttpHeaders({
        'Content-Type': fileType
      }),
      reportProgress: true,
    });

    return this.http.request(req).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.loaded / (event.total || 1);
          return { type: 'progress', progress };
        } else if (event.type === HttpEventType.Response) {
          return { type: 'complete', url: presignedUrl.split('?')[0] };
        }
        return { type: 'other' };
      }),
      catchError(error => {
        console.error('Error uploading file:', error);
        return throwError(() => error);
      })
    );
  }
}