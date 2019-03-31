import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AppFeedback } from '~/app/models/app-feedback';
import { ResultFeedback } from '~/app/models/result-feedback';
import { environment } from '../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})

export class FeedbackRepositoryService {

  constructor(
    private http: HttpClient,
  ) { }

  private appFeedbackUrl = environment.apiUrl + "/Feedback/App";
  private resultFeedbackUrl = environment.apiUrl + "/Feedback/Results";

  addAppFeedback (feedback: AppFeedback): Observable<AppFeedback> {
    return this.http.post<AppFeedback>(this.appFeedbackUrl, feedback, httpOptions);
  }

  addResultFeedback (feedback: ResultFeedback): Observable<ResultFeedback> {
    return this.http.post<ResultFeedback>(this.resultFeedbackUrl, feedback, httpOptions);
  }

}