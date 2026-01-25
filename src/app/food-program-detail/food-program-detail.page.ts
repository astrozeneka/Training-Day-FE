import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Recipe } from '../recipes.service';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { FeedbackService } from '../feedback.service';

interface FoodProgram extends Recipe {}

interface ProgramCategory {
  slug: string;
  name: string;
}

@Component({
  selector: 'app-food-program-detail',
  templateUrl: './food-program-detail.page.html',
  styleUrls: ['./food-program-detail.page.scss'],
})
export class FoodProgramDetailPage implements OnInit {

  isLoading:WritableSignal<boolean> = signal(false);
  foodPrograms:WritableSignal<FoodProgram[]> = signal([]);
  categorySlug: string = null;
  categoryName:WritableSignal<string> = signal(null);

  constructor(
    private http: HttpClient,
    private feedbackService: FeedbackService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.categorySlug = this.route.snapshot.paramMap.get('category');
    this._loadData()
  }

  private _loadData() {
    this.isLoading.set(true);

    this.http.get<ProgramCategory[]>(`${environment.apiEndpoint}/recipe-program-categories`)
    .pipe(
      catchError((error) => {
        this.feedbackService.registerNow('Erreur lors du chargement des catégories.');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    )
    .subscribe((categories) => {
      const category = categories.find(cat => cat.slug === this.categorySlug);
      if (category) {
        this.categoryName.set(category.name);
        this._loadFoodPrograms();
      } else {
        this.feedbackService.registerNow('Catégorie introuvable.');
        this.isLoading.set(false);
      }
    })
  }

  private _loadFoodPrograms() {
    this.http.get<{data: FoodProgram[]}>(`${environment.apiEndpoint}/recipes?f_type=2&f_category=${this.categoryName()}`)
    .pipe(
      catchError((error) => {
        this.feedbackService.registerNow('Erreur lors du chargement des programmes alimentaires.');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    )
    .subscribe((data)=>{
      console.log(data);
      this.foodPrograms.set(data.data);
      this.isLoading.set(false);
    })
  }

}
