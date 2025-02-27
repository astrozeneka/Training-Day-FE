import { Component, OnInit } from '@angular/core';
import { distinct, distinctUntilChanged } from 'rxjs';
import { RecipeCategory, RecipesService } from 'src/app/recipes.service';

@Component({
  selector: 'app-recipe-home',
  templateUrl: './recipe-home.page.html',
  styleUrls: ['./recipe-home.page.scss'],
})
export class RecipeHomePage implements OnInit {
  categories: RecipeCategory[] = []

  constructor(
    private rs: RecipesService
  ) { }

  ngOnInit() {

    // 1. Load user

    // 2. Load recipe's category
    this.rs.onCategoryDetailsData(true, true)
      .pipe(distinctUntilChanged())
      .subscribe((categories:RecipeCategory[]) => {
        console.log(`Categories: ${categories.length}`)
        this.categories = categories
      })
  }

}
