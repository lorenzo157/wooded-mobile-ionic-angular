import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';

// Shared service to coordinate accelerometer usage
export class AccelerometerCoordinator {
  private static instance: AccelerometerCoordinator;
  private activeComponent: string | null = null;
  private accelHandler: PluginListenerHandle | null = null;

  static getInstance(): AccelerometerCoordinator {
    if (!AccelerometerCoordinator.instance) {
      AccelerometerCoordinator.instance = new AccelerometerCoordinator();
    }
    return AccelerometerCoordinator.instance;
  }

  async requestAccelerometer(
    componentType: string,
    callback: (event: any) => void
  ): Promise<boolean> {
    if (this.activeComponent && this.activeComponent !== componentType) {
      // Another component is using the accelerometer
      return false;
    }

    // Stop any existing listener
    if (this.accelHandler) {
      await this.accelHandler.remove();
      this.accelHandler = null;
    }

    this.activeComponent = componentType;
    this.accelHandler = await Motion.addListener('accel', callback);
    return true;
  }

  async releaseAccelerometer(componentType: string): Promise<void> {
    if (this.activeComponent === componentType) {
      if (this.accelHandler) {
        await this.accelHandler.remove();
        this.accelHandler = null;
      }
      this.activeComponent = null;
    }
  }

  isActive(componentType: string): boolean {
    return this.activeComponent === componentType;
  }

  getActiveComponent(): string | null {
    return this.activeComponent;
  }
}

@Component({
  selector: 'height-measure',
  template: `
    <ion-button
      (click)="startMeasuringDistance()"
      [disabled]="
        isMeasuringDistance || isMeasuringHeight || !canStartMeasuring()
      "
      expand="block"
      color="secondary"
    >
      {{ isMeasuringDistance ? 'Calculando distancia...' : 'Medir distancia' }}
    </ion-button>
    <ion-button
      (click)="stopMeasuringDistance()"
      [disabled]="!isMeasuringDistance"
      expand="block"
      color="secondary"
    >
      Detener
    </ion-button>

    <ion-item>
      <ion-input
        label="Distancia entre usted y el árbol (metros)"
        labelPlacement="floating"
        type="number"
        [(ngModel)]="distance"
        min="0"
      ></ion-input>
    </ion-item>

    <ion-button
      (click)="startMeasuringHeight()"
      [disabled]="
        isMeasuringHeight || isMeasuringDistance || !canStartMeasuring()
      "
      color="primary"
      expand="block"
    >
      {{ isMeasuringHeight ? 'Calculando altura...' : 'Medir altura' }}
    </ion-button>
    <ion-button
      (click)="stopMeasuringHeight()"
      [disabled]="!isMeasuringHeight"
      color="primary"
      expand="block"
    >
      Detener
    </ion-button>
  `,
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class HeightMeasureComponent implements OnInit, OnDestroy {
  height: number = 0;
  isMeasuringHeight: boolean = false;
  isMeasuringDistance: boolean = false;
  magnitude: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  distance: number = 10; // Default distance in meters for height calculation
  userHeight: number = 1.74; // Default height in meters

  private accelCoordinator = AccelerometerCoordinator.getInstance();

  @Output() heightChange = new EventEmitter<{
    height: number;
    x: number;
    y: number;
    z: number;
  }>();

  constructor(private authService: AuthService) {
    // Get user height once at initialization since it never changes
    this.authService.getUser().subscribe((user) => {
      if (user?.heightMeters) {
        this.userHeight = +user.heightMeters;
      }
    });
  }

  ngOnInit() {
    // Component initialization logic if needed in the future
  }

  ngOnDestroy() {
    // Clean up when component is destroyed
    this.stopMeasuringHeight();
    this.stopMeasuringDistance();
  }

  canStartMeasuring(): boolean {
    const activeComponent = this.accelCoordinator.getActiveComponent();
    if (activeComponent && activeComponent !== 'height') {
      return false;
    }
    return true;
  }

  async startMeasuringHeight() {
    if (!this.isMeasuringHeight && this.canStartMeasuring()) {
      const success = await this.accelCoordinator.requestAccelerometer(
        'height',
        (event) => {
          let x = event.accelerationIncludingGravity?.x || 0;
          let y = event.accelerationIncludingGravity?.y || 0;
          let z = event.accelerationIncludingGravity?.z || 0;

          this.x = x;
          this.y = y;
          this.z = z;

          this.calculateHeight(x, y, z);
          // Emit updated values
          this.heightChange.emit({
            height: this.height,
            x: this.x,
            y: this.y,
            z: this.z,
          });
        }
      );

      if (success) {
        this.isMeasuringHeight = true;
      }
    }
  }

  async stopMeasuringHeight() {
    if (this.isMeasuringHeight) {
      this.isMeasuringHeight = false;
      await this.accelCoordinator.releaseAccelerometer('height');

      this.heightChange.emit({
        height: this.height,
        x: this.x,
        y: this.y,
        z: this.z,
      });
    }
  }

  async startMeasuringDistance() {
    if (!this.isMeasuringDistance && this.canStartMeasuring()) {
      const success = await this.accelCoordinator.requestAccelerometer(
        'height',
        (event) => {
          let x = event.accelerationIncludingGravity?.x || 0;
          let y = event.accelerationIncludingGravity?.y || 0;
          let z = event.accelerationIncludingGravity?.z || 0;

          this.calculateDistance(x, y, z);
        }
      );

      if (success) {
        this.isMeasuringDistance = true;
      }
    }
  }

  async stopMeasuringDistance() {
    if (this.isMeasuringDistance) {
      this.isMeasuringDistance = false;
      // We can release the accelerometer here if we are not going to measure height right after
      // For now, we assume the user might want to measure height, so we keep the listener active
      // until the main "stop" for the whole component is called.
      // Or, we can release and re-acquire. Let's release.
      await this.accelCoordinator.releaseAccelerometer('height');
    }
  }

  calculateHeight(x: number, y: number, z: number) {
    const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    if (magnitude === 0) {
      this.height = this.userHeight;
    } else {
      const tiltAngleRadians = Math.acos(Math.abs(y) / magnitude);
      if (tiltAngleRadians < 0.1) {
        this.height = this.userHeight; // Avoid division by zero or very small angles
      } else {
        this.height =
          this.distance / Math.tan(tiltAngleRadians) + this.userHeight; // Assuming a distance of 10 meters
      }
    }
  }
  calculateDistance(x: number, y: number, z: number) {
    const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    if (magnitude === 0) {
      this.distance = 10; // Default distance in meters
    } else {
      const tiltAngleRadians = Math.acos(Math.abs(y) / magnitude);
      if (tiltAngleRadians < 0.1) {
        this.distance = 10; // Avoid division by zero or very small angles
      } else {
        this.distance = Math.tan(tiltAngleRadians) * this.userHeight; // Calculate distance based on tilt angle and user height
      }
    }
  }
}
