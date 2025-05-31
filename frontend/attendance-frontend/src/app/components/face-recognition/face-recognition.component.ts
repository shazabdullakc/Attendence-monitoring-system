import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AttendanceService } from '../../services/attendance.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-face-recognition',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './face-recognition.component.html',
  styleUrls: ['./face-recognition.component.scss']
})
export class FaceRecognitionComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef;
  stream: MediaStream | null = null;
  recognitionResult: string = '';
  isProcessing: boolean = false;

  constructor(
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.startCamera();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.snackBar.open('Error accessing camera', 'Close', { duration: 3000 });
    }
  }

  async captureAndRecognize() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const canvas = document.createElement('canvas');
    const video = this.videoElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');

    try {
      const response = await this.attendanceService.recognizeFace(imageData).toPromise();
      if (response.error) {
        this.snackBar.open(response.error, 'Close', { duration: 3000 });
      } else {
        this.recognitionResult = response.message;
        this.snackBar.open('Attendance marked successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/attendance']);

      }
    } catch (error) {
      console.error('Error recognizing face:', error);
      this.snackBar.open('Error recognizing face', 'Close', { duration: 3000 });
    } finally {
      this.isProcessing = false;
    }
  }

  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
