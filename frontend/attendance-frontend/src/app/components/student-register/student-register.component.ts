import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-student-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './student-register.component.html',
  styleUrls: ['./student-register.component.scss']
})
export class StudentRegisterComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef;
  studentName: string = '';
  stream: MediaStream | null = null;
  isLoading: boolean = false;
  isCameraReady: boolean = false;

  constructor(
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('StudentRegisterComponent initialized');
    this.startCamera();
  }

  async startCamera() {
    console.log('Attempting to start camera...');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.isCameraReady = true;
      console.log('Camera started successfully');
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.snackBar.open('Error accessing camera', 'Close', { duration: 3000 });
    }
  }

  async captureAndRegister() {
    console.log('Starting captureAndRegister process...');
    
    if (!this.studentName.trim()) {
      console.log('Student name is empty');
      this.snackBar.open('Please enter student name', 'Close', { duration: 3000 });
      return;
    }

    if (!this.stream || !this.isCameraReady) {
      console.error('Camera is not ready');
      this.snackBar.open('Camera is not ready', 'Close', { duration: 3000 });
      return;
    }

    try {
      this.isLoading = true;
      console.log('Capturing image for student:', this.studentName);

      // Create a canvas and capture the current video frame
      const canvas = document.createElement('canvas');
      const video = this.videoElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the canvas to a blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });

      console.log('Image captured, preparing form data');
      const formData = new FormData();
      formData.append('name', this.studentName);
      formData.append('image', blob, 'student.jpg');

      console.log('Sending registration request to server...');
      const response = await firstValueFrom(this.attendanceService.registerStudent(formData));
      console.log('Server response:', response);

      this.snackBar.open('Student registered successfully!', 'Close', { duration: 3000 });
      this.studentName = ''; // Reset the form
    } catch (error) {
      console.error('Error during registration:', error);
      this.snackBar.open('Error registering student', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    console.log('StudentRegisterComponent destroying...');
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
