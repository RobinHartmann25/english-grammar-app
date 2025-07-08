import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-startpage',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './startpage.html',
  styleUrls: ['./startpage.css'],
})
export class Startpage {
  topic: string = '';
  level: string = '';
  levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  grammarTenses: string[] = [
    'Past Simple',
    'Past Continuous',
    'Past Perfect',
    'Past Perfect Continuous',
    'Present Simple',
    'Present Continuous',
    'Present Perfect',
    'Present Perfect Continuous',
    'Future Simple (will)',
    'Future Continuous',
    'Future Perfect',
    'Future Perfect Continuous',
    'Going to Future',
  ]
  grammar: string = '';
  submitted = false;
  sentences: string[] = [];

  constructor(private api: ApiService, private router: Router) { }


  get allFieldsFilled(): boolean {
    return this.level.trim() !== '' &&
      this.grammar.trim() !== '' &&
      this.topic.trim() !== '';
  }


  async submit() {
    this.submitted = true;
    try {

      const exercises = await this.api.generateExercises(this.topic, this.grammar, this.level);

      this.router.navigateByUrl('/exercisepage', {
        state: { exercises }
      });
    } catch (err) {
      console.error('API-Fehler', err)
    }
  }


  levelSelected = false;
  showSubmitButton = false;

  onLevelChange(event: any) {
    this.levelSelected = true;

    setTimeout(() => {
      this.showSubmitButton = true;
    }, 1000);
  }

}
