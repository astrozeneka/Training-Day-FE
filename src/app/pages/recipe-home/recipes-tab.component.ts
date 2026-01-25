import { Component, Input } from '@angular/core';
import { RecipeCategory } from 'src/app/recipes.service';

@Component({
  selector: 'app-recipes-tab',
  templateUrl: './recipes-tab.component.html',
  styleUrls: ['./recipes-tab.component.scss']
})
export class RecipesTabComponent {
  @Input() categories: RecipeCategory[] = [];
}
