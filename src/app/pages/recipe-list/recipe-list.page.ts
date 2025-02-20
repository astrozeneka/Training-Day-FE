import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ContentService } from '../../content.service';
import { FeedbackService } from '../../feedback.service';
import { filter, Observable, Subject } from 'rxjs';
import { RecipesService } from '../../recipes.service';
import { User } from 'src/app/models/Interfaces';
import { PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.page.html',
  styleUrls: ['./recipe-list.page.scss'],
})
export class RecipeListPage implements OnInit {
  recipes = []
  displayedRecipes = []

  // User
  user:User = undefined

  // Categories
  categories: string[] = []
  filter:string|undefined = undefined

  constructor(
      private router: Router,
      protected cs: ContentService,
      protected cdr: ChangeDetectorRef,
      private fs: FeedbackService,
      private rs: RecipesService,
      private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(filter((event:NavigationEnd) => event.url == '/recipe-list'))
      .subscribe(() => {
        // Switch map architecture might be better (to see leter)
        // Load recipes here
        this.rs.onRecipesData(true, true)
          .subscribe((recipes) => {
            this.recipes = recipes
            this.processRecipeFilter()
          })
      })

    // Load the user information
    this.cs.userStorageObservable.getStorageObservable().subscribe((res)=>{
      this.user = res
    })

    // Load the categories
    this.rs.onCategoryData(true, true).subscribe((categories) => {
      this.categories = categories
    })
  }

  goToAddRecipe(){
    this.router.navigate(['/add-recipe'])
  }

  filterBy(category:string){
    console.log("Filter by: ", category)
    this.filter = category
    this.processRecipeFilter()
    this.popoverController.dismiss()
  }

  processRecipeFilter(){
    if (this.filter == undefined){
      this.displayedRecipes = this.recipes
    } else {
      this.displayedRecipes = this.recipes.filter((recipe) => recipe.category == this.filter)
    }
    this.cdr.detectChanges()
  }
}
