import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilKeyChanged } from 'rxjs';
import { Recipe, RecipesService } from 'src/app/recipes.service';

@Component({
  selector: 'app-recipe-by-category',
  templateUrl: './recipe-by-category.page.html',
  styleUrls: ['./recipe-by-category.page.scss'],
})
export class RecipeByCategoryPage implements OnInit {

  category: string | null = null;
  recipes: Recipe[] = [];
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private rs: RecipesService
  ) { }

  ngOnInit() {
    this.category = this.route.snapshot.paramMap.get('category');

    // 2. Load all recipes by category
    this.isLoading = true;
    this.rs.onRecipeDataByCategory(this.category, true, true)
      .pipe(distinctUntilKeyChanged('length'))
      .subscribe((recipes) => {
        this.isLoading = false;
        this.recipes = recipes;
        console.log(`Recipes in category ${this.category}: ${recipes.length}`);
      })
  }

}
