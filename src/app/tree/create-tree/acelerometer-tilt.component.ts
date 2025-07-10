import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { IonicModule } from '@ionic/angular';

// Import the coordinator from height component
import { AccelerometerCoordinator } from './acelerometer-height.component';

@Component({
  selector: 'tilt-measure',
  template: `
    <ion-button
      (click)="startMeasuringTilt()"
      [disabled]="isMeasuringTilt || !canStartMeasuring()"
      expand="block"
    >
      {{ isMeasuringTilt ? 'Calculando inclinación...' : 'Medir inclinación' }}
    </ion-button>
    <ion-button
      (click)="stopMeasuringTilt()"
      [disabled]="!isMeasuringTilt"
      expand="block"
    >
      Detener
    </ion-button>
  `,
  standalone: true,
  imports: [IonicModule],
})
export class TiltMeasureComponent implements OnDestroy {
  angle: number = 0;
  isMeasuringTilt: boolean = false;
  magnitude: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;

  private accelCoordinator = AccelerometerCoordinator.getInstance();

  @Output() tiltChange = new EventEmitter<{
    angle: number;
    x: number;
    y: number;
    z: number;
  }>();

  ngOnDestroy() {
    // Clean up when component is destroyed
    this.stopMeasuringTilt();
  }

  canStartMeasuring(): boolean {
    const activeComponent = this.accelCoordinator.getActiveComponent();
    if (activeComponent && activeComponent !== 'tilt') {
      return false;
    }
    return true;
  }

  async startMeasuringTilt() {
    if (!this.isMeasuringTilt && this.canStartMeasuring()) {
      const success = await this.accelCoordinator.requestAccelerometer(
        'tilt',
        (event) => {
          let x = event.accelerationIncludingGravity?.x || 0;
          let y = event.accelerationIncludingGravity?.y || 0;
          let z = event.accelerationIncludingGravity?.z || 0;

          this.x = x;
          this.y = y;
          this.z = z;

          this.calculateTiltAngle(x, y, z);
          // Emit updated values
          this.tiltChange.emit({
            angle: this.angle,
            x: this.x,
            y: this.y,
            z: this.z,
          });
        }
      );

      if (success) {
        this.isMeasuringTilt = true;
      }
    }
  }

  async stopMeasuringTilt() {
    if (this.isMeasuringTilt) {
      this.isMeasuringTilt = false;
      await this.accelCoordinator.releaseAccelerometer('tilt');

      this.tiltChange.emit({
        angle: this.angle,
        x: this.x,
        y: this.y,
        z: this.z,
      });
    }
  }

  calculateTiltAngle(x: number, y: number, z: number) {
    const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    if (magnitude === 0) {
      this.angle = 0;
    } else {
      const tiltAngleRadians = Math.acos(y / magnitude);
      this.angle = (tiltAngleRadians * 180) / Math.PI; // Convert to degrees
    }
  }
}
