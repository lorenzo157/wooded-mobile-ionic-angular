
import { Component, EventEmitter, Output } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'tilt-measure',
  template: `
    <div>
      <ion-button (click)="startMeasuringTilt()">Medir inclinación</ion-button>
      <ion-button (click)="stopMeasuringTilt()">Detener medición</ion-button>
    </div>
  `,
  standalone: true,
  imports: [IonicModule],
})
export class TiltMeasureComponent {
  angle: number = 0;
  isMeasuringTilt: boolean = false;
  magnitude: number = 0;
  accelHandler: PluginListenerHandle | null = null;
  x: number = 0;
  y: number = 0;
  z: number = 0;

  @Output() tiltChange = new EventEmitter<{
    angle: number;
    x: number;
    y: number;
    z: number;
  }>();

  async startMeasuringTilt() {
    if (!this.isMeasuringTilt) {
      this.isMeasuringTilt = true;

      this.accelHandler = await Motion.addListener('accel', (event) => {
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
      });
    }
  }

  stopMeasuringTilt() {
    if (this.isMeasuringTilt) {
      this.isMeasuringTilt = false;

      if (this.accelHandler) {
        this.accelHandler.remove();
        this.accelHandler = null;
        //Motion.removeAllListeners();
      }

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
      const tiltAngleRadians = Math.acos(x / magnitude);
      this.angle = (tiltAngleRadians * 180) / Math.PI; // Convert to degrees
    }
  }
}
