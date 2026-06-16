import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-echeance-detail',
  templateUrl: './echeance-detail.page.html',
  styleUrls: ['./echeance-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EcheanceDetailPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
