import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, throwError } from 'rxjs';
import { FeedbackService } from 'src/app/feedback.service';

interface ProgramCategory {
  slug: string;
  name: string;
}

@Component({
  selector: 'app-food-program-list',
  templateUrl: './food-program-list.component.html',
  styleUrls: ['./food-program-list.component.scss']
})
export class FoodProgramListComponent implements OnInit {

  isLoading: WritableSignal<boolean> = signal(false);
  programs: WritableSignal<ProgramCategory[]> = signal([]);

  constructor(
    private http: HttpClient,
    private feedbackService: FeedbackService
  ) { }

  ngOnInit() {
    this._loadCategories();
  }

  private _loadCategories() {
    this.isLoading.set(true);
    this.http.get<ProgramCategory[]>(`${environment.apiEndpoint}/recipe-program-categories`)
    .pipe(
      catchError((error) => {
        this.feedbackService.registerNow('Erreur lors du chargement des catégories.');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    )
    .subscribe((data) => {
      this.programs.set(data);
      this.isLoading.set(false);
    })
  }

}
