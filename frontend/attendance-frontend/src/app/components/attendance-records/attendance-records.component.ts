import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AttendanceService } from '../../services/attendance.service';

interface AttendanceRecord {
  id: number;
  name: string;
  lastAttendance: string | null;
}

@Component({
  selector: 'app-attendance-records',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './attendance-records.component.html',
  styleUrls: ['./attendance-records.component.scss']
})
export class AttendanceRecordsComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  displayedColumns: string[] = ['id', 'name', 'lastAttendance'];
  isLoading = true;
  error: string | null = null;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.loadAttendanceRecords();
  }

  loadAttendanceRecords(): void {
    this.isLoading = true;
    this.error = null;

    this.attendanceService.getAttendanceRecords().subscribe({
      next: (records) => {
        this.attendanceRecords = records;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading attendance records:', err);
        this.error = 'Failed to load attendance records. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  sortData(sort: Sort) {
    const data = this.attendanceRecords.slice();
    
    if (!sort.active || sort.direction === '') {
      this.attendanceRecords = data;
      return;
    }

    this.attendanceRecords = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'lastAttendance': 
          // Handle null values for attendance
          if (a.lastAttendance === null) return isAsc ? -1 : 1;
          if (b.lastAttendance === null) return isAsc ? 1 : -1;
          return this.compare(
            new Date(a.lastAttendance).getTime(), 
            new Date(b.lastAttendance).getTime(), 
            isAsc
          );
        default: return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  refreshData(): void {
    this.loadAttendanceRecords();
  }
}