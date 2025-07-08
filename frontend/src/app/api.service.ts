import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  async generateExercises(topic: string, grammar: string, level: string): Promise<string[]> {
    console.log(topic + grammar + level)
    const response: any = await firstValueFrom(
      this.http.post('http://127.0.0.1:5000/generate',
        { topic, grammar, level },
        { headers: { 'Content-Type': 'application/json' } }
      )
    );
    return response.sentences;
  }

  async getHint(sentence: string): Promise<string> {
    const response: any = await firstValueFrom(
      this.http.post('http://127.0.0.1:5000/hint',
        { sentence },
        { headers: { 'Content-Type': 'application/json' } }
      )
    );
    return response.hint;
  }

  async submitExerciseAnswers(exercises: string[], answers: string[]): Promise<any> {
    const payload = { exercises, answers };
    const response: any = await firstValueFrom(
      this.http.post('http://127.0.0.1:5000/getFeedback', payload, {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    return response.feedbacks;
  }

}