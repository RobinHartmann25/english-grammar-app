import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-exercisepage',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatIconModule, MatDividerModule],
  templateUrl: './exercisepage.html',
  styleUrls: ['./exercisepage.css']
})
export class Exercisepage {
  sentences: string[] = [];
  answers: string[] = [];
  hints: string[] = [];
  hintRequested: boolean[] = [];
  feedbacks: string[] = [];

  constructor(private api: ApiService) { }

  ngOnInit() {

    const navigation = history.state;
    console.log(navigation)
    if (navigation && navigation.exercises) {
      this.sentences = navigation.exercises;
      this.answers = new Array(this.sentences.length).fill('');
      this.hints = new Array(this.sentences.length).fill('')
      this.hintRequested = Array(this.sentences.length).fill(false);
      this.feedbacks = Array(this.sentences.length).fill('');
      console.log(this.answers)
    }
  }

  async getHint(i: number) {
    const sentence = this.sentences[i];
    if (this.hintRequested[i])
      return;
    else {
      try {
        const hint = await this.api.getHint(sentence);
        this.hints[i] = hint;
      } catch (err) {
        console.error('Fehler bei der Hilfestellung', err);
      }
    }
  }

  async submitAnswers() {
    console.log(this.sentences, this.answers)
    try {
      this.feedbacks = await this.api.submitExerciseAnswers(this.sentences, this.answers);
    } catch (err) {
      console.log('Fehler beim Senden:', err);
    }
  }
}
