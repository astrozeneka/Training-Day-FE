import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ContentService } from '../../content.service';
import { FeedbackService } from '../../feedback.service';
import { filter, Observable, Subject } from 'rxjs';
import { RecipesService } from '../../recipes.service';


@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.page.html',
  styleUrls: ['./recipe-list.page.scss'],
})
export class RecipeListPage implements OnInit {
  recipes = []

  constructor(
      private router: Router,
      protected cs: ContentService,
      protected cdr: ChangeDetectorRef,
      private fs: FeedbackService,
      private rs: RecipesService
  ) { }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Switch map architecture might be better (to see leter)
        // Load recipes here
        this.rs.onRecipesData(true, true)
          .subscribe((recipes) => {
            console.log(recipes)
            this.recipes = recipes
          })
      })
  }

}
