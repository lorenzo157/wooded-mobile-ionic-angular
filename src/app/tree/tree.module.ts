import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeRoutingModule } from './tree-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthModule } from '../auth/auth.module';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { TreeService } from './tree.service';
import { ListTreesComponent } from './list-trees/list-trees.component';
import { DetailTreeComponent } from './detail-tree/detail-tree.component';
import { CreateTreeComponent } from './create-tree/create-tree.component';
import { TiltMeasureComponent } from './create-tree/acelerometer-tilt.component';
import { HeightMeasureComponent } from './create-tree/acelerometer-height.component';

@NgModule({
  declarations: [ListTreesComponent, CreateTreeComponent, DetailTreeComponent],
  imports: [
    CommonModule,
    TreeRoutingModule,
    FormsModule,
    IonicModule,
    AuthModule,
    NavigationComponent,
    ReactiveFormsModule,
    TiltMeasureComponent,
    HeightMeasureComponent,
  ],
  providers: [TreeService],
})
export class TreeModule {}
