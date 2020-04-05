import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { baseURL } from '../shared/baseurl';
import { Leader } from '../shared/leader';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderService {

  constructor(
    private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService
  ) {
  }

  getLeaders(): Observable<Leader[]> {
    return this.http.get<Leader[]>(baseURL + 'leadership')
      .pipe(
        catchError(this.processHTTPMsgService.handleError)
      );
  }

  getLeader(id: number): Observable<Leader> {
    return this.http.get<Leader>(baseURL + 'leadership/' + id)
      .pipe(
        catchError(this.processHTTPMsgService.handleError)
      );
  }

  getFeaturedLeader(): Observable<Leader> {
    return this.http.get<Leader[]>(baseURL + 'leadership?featured=true')
      .pipe(
        map(leader => leader[0]),
        catchError(this.processHTTPMsgService.handleError)
      );
  }
}
