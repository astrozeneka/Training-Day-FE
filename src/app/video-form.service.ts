import { Injectable } from '@angular/core';
import { ContentService } from './content.service';
import { FeedbackService } from './feedback.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class VideoFormService {

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) { }

  // Fetch the category hierarchy from the server
  fetchCategoryHierarchy(): Observable<any> {
    return this.contentService.getCollection('/videos/category-hierarchy')
      .pipe(
        catchError((error) => {
          console.error('Error fetching category hierarchy:', error);
          this.feedbackService.registerNow('Erreur lors du chargement des catégories', 'danger');
          return throwError(() => new Error('Erreur lors du chargement des catégories'));
        }),
        map((response: any) => {
          console.log('Category hierarchy loaded:', response);
          return response;
        })
      );
  }

  // Fetch the program hierarchy from the server
  fetchProgramHierarchy(): Observable<any> {
    return this.contentService.getCollection('/videos/programs-hierarchy')
      .pipe(
        catchError((error) => {
          console.error('Error fetching program hierarchy:', error);
          this.feedbackService.registerNow('Erreur lors du chargement des programmes', 'danger');
          return throwError(() => new Error('Erreur lors du chargement des programmes'));
        }),
        map((response: any) => {
          console.log('Program hierarchy loaded:', response);
          return response;
        })
      )
  }
}
