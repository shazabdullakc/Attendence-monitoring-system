import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceRecognitionComponent } from './face-recognition.component';

describe('FaceRecognitionComponent', () => {
  let component: FaceRecognitionComponent;
  let fixture: ComponentFixture<FaceRecognitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceRecognitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
