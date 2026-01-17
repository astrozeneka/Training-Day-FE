import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-food-program-detail',
  templateUrl: './food-program-detail.page.html',
  styleUrls: ['./food-program-detail.page.scss'],
})
export class FoodProgramDetailPage implements OnInit {

  programs = [
    {
      id: 1,
      title: 'Programme Petit-Déjeuner',
      calories: '300-400 kcal',
      icon: 'cafe-outline'
    },
    {
      id: 2,
      title: 'Programme Déjeuner Léger',
      calories: '500-600 kcal',
      icon: 'restaurant-outline'
    },
    {
      id: 3,
      title: 'Programme Déjeuner Complet',
      calories: '700-900 kcal',
      icon: 'pizza-outline'
    },
    {
      id: 4,
      title: 'Programme Dîner',
      calories: '400-500 kcal',
      icon: 'moon-outline'
    },
    {
      id: 5,
      title: 'Programme Snack Protéiné',
      calories: '200-300 kcal',
      icon: 'fitness-outline'
    },
    {
      id: 6,
      title: 'Programme Musculation',
      calories: '800-1000 kcal',
      icon: 'barbell-outline'
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
