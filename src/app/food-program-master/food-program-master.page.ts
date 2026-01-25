import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, throwError } from 'rxjs';
import { FeedbackService } from '../feedback.service';

interface ProgramCategory {
  slug: string;
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-food-program-master',
  templateUrl: './food-program-master.page.html',
  styleUrls: ['./food-program-master.page.scss'],
})
export class FoodProgramMasterPage implements OnInit {

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
    this.http.get<{data: ProgramCategory[]}>(`${environment.apiEndpoint}/recipe-program-categories`)
    .pipe(
      catchError((error) => {
        this.feedbackService.registerNow('Erreur lors du chargement des catégories.');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    )
    .subscribe((data) => {
      console.log(data);
      this.programs.set(data.data);
      this.isLoading.set(false);
    })
  }

}
