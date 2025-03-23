import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  registerStudent(name: string, image: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add_student`, { name, image });
  }

  recognizeFace(image: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recognize`, { image });
  }

  getStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/students`);
  }
}
