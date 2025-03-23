import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AttendanceService } from '../../services/attendance.service';

interface Student {
  id: number;
  name: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  students: Student[] = [];

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit() {
    this.loadStudents();
  }

  async loadStudents() {
    try {
      this.students = await this.attendanceService.getStudents().toPromise();
    } catch (error) {
      console.error('Error loading students:', error);
    }
  }
}
