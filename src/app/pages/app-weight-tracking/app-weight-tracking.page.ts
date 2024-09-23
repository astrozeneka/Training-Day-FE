import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { catchError, throwError } from 'rxjs';
import { Chart } from 'chart.js';
import { fr } from 'date-fns/locale';
import 'chartjs-adapter-date-fns';
import { FormComponent } from 'src/app/components/form.component';
import { ContentService } from 'src/app/content.service';
import { FeedbackService } from 'src/app/feedback.service';

@Component({
  selector: 'app-app-weight-tracking',
  templateUrl: './app-weight-tracking.page.html',
  styleUrls: ['./app-weight-tracking.page.scss'],
})
export class AppWeightTrackingPage extends FormComponent implements OnInit {
  user: any
  weightData: Array<any> = []
  loading: boolean

  isFormLoading = false
  lineChart = {
    data: undefined,
    options: undefined
  }

  weightForm = new FormGroup({
    date: new FormControl('', [Validators.required]),
    weight: new FormControl('', [Validators.required]),
  })
  override displayedError = {
    'date': undefined,
    'weight': undefined
  }

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router
  ) { 
    super()
  }

  ngOnInit() {
    this.loading = true

    this.contentService.userStorageObservable.getStorageObservable().subscribe((user) => {
      this.user = user
      this.loadData()
    })

    this.lineChart.data = {
      datasets: [
        {
          data: [65, 66, 67, 68, 69, 70],
          label: 'Poids (kg)',
          borderColor: '#d05f23',
        }
      ],
      labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06']
    }
    this.lineChart.options = {
      plugins: {
      },
      responsive: true,
      maintainAspectRatio: false,
      
      scales: {
      x: {
        type: 'time',
        time: {
        unit: 'day',
        tooltipFormat: 'dd MM yyyy',
        displayFormats: {
          day: 'dd MMM yy'
        }
        },
        title: {
        display: true,
        text: 'Date'
        },
        adapters: {
        date: {
          locale: fr
        }
        }
      },
      y: {
        title: {
        display: true,
        text: 'Poids (kg)'
        }
      }
      }
    }
  }

  loadData() {
    this.contentService.getCollection('/weights').subscribe((response) => {
      this.loading = false
      this.weightData = response
      let data = response.map((item) => item.weight)
      let labels = response.map((item) => item.date)
      this.lineChart.data = {
        datasets: [
          {
            data: data,
            label: 'Poids (kg)',
            borderColor: '#d05f23',
          }
        ],
        labels: labels
      }
    })
  }

  submitWeightForm(event){
    event.preventDefault()
    if (!this.weightForm.valid)
      return
    this.isFormLoading = true

    this.contentService.post('/weights', {
      ...this.weightForm.value,
    }).pipe(catchError((error) => {
      console.log("Error")
      if(error.status == 422) {
        this.manageValidationFeedback(error, 'weight', this.weightForm)
        this.manageValidationFeedback(error, 'date', this.weightForm)
      }else{
        this.feedbackService.registerNow("Une erreur est survenue : " + error.error.message
          , 'danger')
      }
      return throwError(error)
    }))
    .subscribe((response) => {
      console.log("Registered")
      this.feedbackService.registerNow("Le poids a été enregistré", 'success')
      this.weightForm.reset()
      this.loadData() // Because angular doesn't allow page reloading like in web
    })
    this.isFormLoading = false
  }

  deleteWeight(id){
    this.contentService.delete(`/weights`, `${id}`)
    .subscribe((response) => {
      this.feedbackService.registerNow("L'historique a été mis à jour", 'success')
      this.loadData()
    })
  }
}
