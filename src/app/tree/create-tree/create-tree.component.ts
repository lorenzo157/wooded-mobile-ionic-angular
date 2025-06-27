import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { TreeService, NumberToStringMap } from '../tree.service';
import { CreateTreeDto } from '../dto/create-tree.dto';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { UiService } from '../../utils/ui.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  windExposureOptions,
  vigorOptions,
  canopyDensityOptions,
  growthSpaceOptions,
  treeValueOptions,
  frequencyUseOptions,
  potentialDamageOptions,
  treeTypeOptions,
  conflictOptions,
  interventionOptions,
  fruitingBodiesOfFungiOnNeckOrRoots,
  mechanicalDamageToRoots,
  stranglingRoots,
  deadRoots,
  symptomsDiseaseOfRootsInCrown,
  gallsTermiteMoundsAnthills,
  cankersTrunk,
  cavitiesTrunk,
  slendernessCoefficent,
  lostOrDeadBark,
  multipleTrunks,
  forkTrunk,
  inclination,
  woodRotTrunk,
  wounds,
  fissuresTrunk,
  cankersBranch,
  cavitiesBranches,
  fruitingBodiesOfFungi,
  forkBranch,
  hangingOrBrokenBranches,
  deadBranches,
  overExtendedBranches,
  fissuresBranches,
  woodRot,
  interferenceWithTheElectricalGrid,
} from '../../constants/API';

@Component({
  selector: 'app-create-tree',
  templateUrl: './create-tree.component.html',
  styleUrls: ['./create-tree.component.scss'],
  standalone: false,
})
export class CreateTreeComponent implements OnInit {
  windExposureOptions = windExposureOptions;
  vigorOptions = vigorOptions;
  canopyDensityOptions = canopyDensityOptions;
  growthSpaceOptions = growthSpaceOptions;
  treeValueOptions = treeValueOptions;
  frequencyUseOptions = frequencyUseOptions;
  potentialDamageOptions = potentialDamageOptions;
  treeTypeOptions = treeTypeOptions;
  conflictOptions = conflictOptions;
  interventionOptions = interventionOptions;
  // DEFECTOS EN LAS RAICES
  fruitingBodiesOfFungiOnNeckOrRootsEntries = Object.entries(
    fruitingBodiesOfFungiOnNeckOrRoots
  );
  mechanicalDamageToRootsEntries = Object.entries(mechanicalDamageToRoots);
  stranglingRootsEntries = Object.entries(stranglingRoots);
  deadRootsEntries = Object.entries(deadRoots);
  symptomsDiseaseOfRootsInCrownEntries = Object.entries(
    symptomsDiseaseOfRootsInCrown
  );
  // DEFECTOS EN TRONCO Y CUELLO
  gallsTermiteMoundsAnthillsEntries = Object.entries(
    gallsTermiteMoundsAnthills
  );
  cankersTrunkEntries = Object.entries(cankersTrunk);
  multipleTrunksEntries = Object.entries(multipleTrunks);
  forkTrunkEntries = Object.entries(forkTrunk);
  fissuresTrunkEntries = Object.entries(fissuresTrunk);
  // DEFECTOS EN RAMAS ESTRUCTURASLES Y RAMAS MENORES
  cankersBranchEntries = Object.entries(cankersBranch);
  cavitiesBranchesEntries = Object.entries(cavitiesBranches);
  fruitingBodiesOfFungiEntries = Object.entries(fruitingBodiesOfFungi);
  forkBranchEntries = Object.entries(forkBranch);
  hangingOrBrokenBranchesEntries = Object.entries(hangingOrBrokenBranches);
  deadBranchesEntries = Object.entries(deadBranches);
  overExtendedBranchesEntries = Object.entries(overExtendedBranches);
  fissuresBranchesEntries = Object.entries(fissuresBranches);
  woodRotEntries = Object.entries(woodRot);
  interferenceWithTheElectricalGridEntries = Object.entries(
    interferenceWithTheElectricalGrid
  );
  selectedDefectsSummary: { label: string; value: string }[] = [];
  private idProject!: number;
  idTree: number | null = null;
  projectType!: boolean;
  treeForm: FormGroup;
  private dch!: number;
  hangingOrBrokenBranches_branches: boolean = false;
  deadBranches_branches: boolean = false;
  showWarning: boolean = false;
  operation: string = 'Registración';
  private image: any;
  tiltValues = { angle: 0, x: 0, y: 0, z: 0 };
  onTiltChange(event: { angle: number; x: number; y: number; z: number }) {
    this.tiltValues = event;
    this.treeForm
      .get('incline')
      ?.setValue(Number(Number(event.angle.toFixed(2))));
  }
  constructor(
    private route: ActivatedRoute,
    private treeService: TreeService,
    private router: Router,
    private fb: FormBuilder,
    private uiService: UiService
  ) {
    this.treeForm = this.fb.group({
      photoFileName: [null],
      cityBlock: [null],
      perimeter: [null, Validators.required],
      height: [null, Validators.required],
      incline: [null, Validators.required],
      treesInTheBlock: [null, Validators.required],
      useUnderTheTree: [null, Validators.required],
      frequencyUse: [null, Validators.required],
      potentialDamage: [null, Validators.required],
      nothingUnderTree: [false],
      isMovable: [false],
      isRestrictable: [false],
      isMissing: [false],
      isDead: [false],
      exposedRoots: [false],
      windExposure: [null, Validators.required],
      vigor: [null, Validators.required],
      canopyDensity: [null, Validators.required],
      growthSpace: [null, Validators.required],
      treeValue: [null, Validators.required],
      address: ['', Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      treeTypeName: [null, Validators.required],
      conflictsNames: [[]],
      diseasesNames: this.fb.array([]),
      interventionsNames: [[]],
      pestsNames: this.fb.array([]),
      fruitingBodiesOfFungiOnNeckOrRoots: [null],
      mechanicalDamageToRoots: [null],
      stranglingRoots: [null],
      deadRoots: [null],
      symptomsDiseaseOfRootsInCrown: [null],
      gallsTermiteMoundsAnthills: [null],
      isWounds: [null],
      wounds_width: [null],
      cankersTrunk: [null],
      isCavitiesTrunk: [false],
      cavitiesTrunk_t: [null],
      isLostOrDeadBark: [false],
      lostOrDeadBark_width: [null],
      multipleTrunks: [null],
      forkTrunk: [null],
      isWoodRoot: [false],
      isWoodRoot_fruitingBodies: [false],
      woodRoot_t: [null],
      fissuresTrunk: [null],
      cankersBranch: [null],
      cavitiesBranches: [null],
      fruitingBodiesOfFungi: [null],
      forkBranch: [null],
      hangingOrBrokenBranches: [null],
      hangingOrBrokenBranches_branches: [null],
      deadBranches: [null],
      deadBranches_branches: [null],
      overExtendedBranches: [null],
      fissuresBranches: [null],
      woodRot: [null],
      interferenceWithTheElectricalGrid: [null],
    });
    this.addConditionalValidation();
  }
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.idProject = +params.get('idProject')!; // Retrieve project ID from route
      this.projectType = params.get('projectType') === 'muestreo';
      if (params.get('idTree') !== '0') this.idTree = +params.get('idTree')!;
      this.operation = this.idTree ? 'Actualización' : 'Registración';
      console.log(this.idTree);
    });
    if (this.projectType) {
      this.treeForm.get('treeValue')?.clearValidators();
      this.treeForm.get('treeValue')?.updateValueAndValidity();
    } else {
      this.treeForm.get('treesInTheBlock')?.clearValidators();
      this.treeForm.get('treesInTheBlock')?.updateValueAndValidity();
    }
    this.treeForm.valueChanges.pipe(debounceTime(100)).subscribe(() => {
      this.updateSelectedDefectsSummary();
    });
  }
  addConditionalValidation() {
    const isMissingControl = this.treeForm.get('isMissing');
    const isDeadControl = this.treeForm.get('isDead');
    const nothingUnderTree = this.treeForm.get('nothingUnderTree');

    nothingUnderTree?.valueChanges.subscribe((value) => {
      if (value) {
        this.treeForm.get('useUnderTheTree')?.clearValidators();
        this.treeForm.get('frequencyUse')?.clearValidators();
      } else {
        this.treeForm
          .get('useUnderTheTree')
          ?.setValidators([Validators.required]);
        this.treeForm.get('frequencyUse')?.setValidators([Validators.required]);
      }
      this.treeForm.get('useUnderTheTree')?.updateValueAndValidity();
      this.treeForm.get('frequencyUse')?.updateValueAndValidity();
    });
    // Listen  to changes on isMissing and isMovable
    isMissingControl?.valueChanges.subscribe((isMissing) => {
      this.updateConditionalValidators(isMissing || isDeadControl?.value);
    });

    isDeadControl?.valueChanges.subscribe((isDead) => {
      this.updateConditionalValidators(isMissingControl?.value || isDead);
    });

    this.treeForm.get('perimeter')?.valueChanges.subscribe((perimeterValue) => {
      if (perimeterValue) this.dch = perimeterValue / Math.PI;
    });
    this.treeForm.get('isWoodRoot')?.valueChanges.subscribe((isWoodRoot) => {
      if (!isWoodRoot)
        this.treeForm.get('isWoodRoot_fruitingBodies')?.setValue(false);
    });
  }
  onTogglePosition(event: any) {
    if (event.detail.checked) {
      this.getLocation();
    } else {
      // Disable and clear the fields
      this.treeForm.patchValue({
        latitude: null,
        longitude: null,
      });
    }
  }
  updateConditionalValidators(condition: boolean) {
    const fieldsToValidate = [
      'perimeter',
      'height',
      'incline',
      'useUnderTheTree',
      'frequencyUse',
      'potentialDamage',
      'windExposure',
      'vigor',
      'canopyDensity',
      'growthSpace',
      'treeValue',
      'treeTypeName',
    ];
    fieldsToValidate.forEach((field) => {
      const control = this.treeForm.get(field);
      if (condition) {
        control?.clearValidators();
      } else {
        control?.setValidators([Validators.required]);
      }
      control?.updateValueAndValidity();
    });
  }

  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      // Update form values
      this.treeForm.patchValue({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.uiService.alert(`${error.message}`, 'Geolocalización Error');
      }
    }
  }
  addItem(nameArray: string) {
    (this as any)[nameArray + 'Names'].push(
      this.fb.control('', Validators.required)
    );
  }
  removeItem(index: number, nameArray: string) {
    (this as any)[nameArray + 'Names'].removeAt(index);
  }
  get pestsNames() {
    return this.treeForm.get('pestsNames') as FormArray;
  }
  get conflictsNames() {
    return this.treeForm.get('conflictsNames') as FormArray;
  }
  get diseasesNames() {
    return this.treeForm.get('diseasesNames') as FormArray;
  }
  get interventionsNames() {
    return this.treeForm.get('interventionsNames') as FormArray;
  }

  showBranchesInput(event: any, nameInput: string) {
    const selectedValue = event.detail.value;
    selectedValue > 2;
    if (selectedValue > 2) {
      (this as any)[nameInput + '_branches'] = true;
      this.treeForm
        .get(nameInput + '_branches')
        ?.setValidators([Validators.required]);
    } else {
      (this as any)[nameInput + '_branches'] = false;
      this.treeForm.get(nameInput + '_branches')?.clearValidators();
    }
    this.treeForm.get(nameInput + '_branches')?.updateValueAndValidity();
  }
  async displayWarningSign() {
    // Initialize an array to hold invalid field messages
    const invalidFields: string[] = [];

    // Check each control in the form
    Object.keys(this.treeForm.controls).forEach((controlName) => {
      // If the control is invalid, add a message to the array
      if (this.treeForm.get(controlName)?.invalid) {
        invalidFields.push(controlName); // You can customize this to show more user-friendly names if needed
      }
    });
    // If there are invalid fields, create and present a warning message
    if (invalidFields.length > 0) {
      const message = `Por favor completa los siguiente campos requeridos: ${invalidFields.join(
        ', '
      )}`;

      await this.uiService.toast(message, 'danger');
    } else {
      // Form submit logic here
    }
  }
  async takePhoto() {
    try {
      this.image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      this.treeForm
        .get('photoFileName')
        ?.setValue(`tree_${Date.now() - 1734000000000}.jpg`);
    } catch (error) {
      this.uiService.alert('Error al tomar la foto', 'Error');
    }
  }

  async onSubmit() {
    console.log(
      this.treeForm.get('pestsNames')?.value,
      'pestes'
    );
    if (this.treeForm.valid) {
      console.log('is validoooo');
      await this.uiService.alert(
        '¿Desea finalizar la ' + this.operation + ' del árbol?',
        this.operation,
        [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Confirmar',
            handler: () => {
              this.createTree();
            },
          },
        ]
      );
    } else {
      this.displayWarningSign();
    }
  }
  createTree() {
    let newTree = new CreateTreeDto();
    newTree.isMissing = this.treeForm.get('isMissing')?.value;
    newTree.isDead = this.treeForm.get('isDead')?.value;
    newTree.projectId = this.idProject;
    newTree.photoFileName = this.treeForm.get('photoFileName')?.value;
    newTree.cityBlock = this.treeForm.get('cityBlock')?.value;
    newTree.address = this.treeForm.get('address')?.value;
    newTree.latitude = this.treeForm.get('latitude')?.value;
    newTree.longitude = this.treeForm.get('longitude')?.value;
    newTree.treesInTheBlock = this.treeForm.get('treesInTheBlock')?.value;

    if (newTree.isMissing || newTree.isDead) {
      newTree.isMissing
        ? (newTree.interventionsNames = ['plantacion de arbol faltante'])
        : (newTree.interventionsNames = ['extraccion del arbol']);
    } else {
      newTree.risk = 0;
      newTree.perimeter = this.treeForm.get('perimeter')?.value;
      newTree.dch = this.dch ?? null;
      newTree.height = this.treeForm.get('height')?.value;
      newTree.incline = this.treeForm.get('incline')?.value;
      newTree.useUnderTheTree = this.treeForm.get('useUnderTheTree')?.value;
      newTree.frequencyUse = this.treeForm.get('frequencyUse')?.value;
      newTree.potentialDamage = this.treeForm.get('potentialDamage')?.value;
      newTree.isMovable = this.treeForm.get('isMovable')?.value;
      newTree.isRestrictable = this.treeForm.get('isRestrictable')?.value;
      newTree.exposedRoots = this.treeForm.get('exposedRoots')?.value;
      newTree.windExposure = this.treeForm.get('windExposure')?.value;
      newTree.vigor = this.treeForm.get('vigor')?.value;
      newTree.canopyDensity = this.treeForm.get('canopyDensity')?.value;
      newTree.growthSpace = this.treeForm.get('growthSpace')?.value;
      newTree.treeValue = this.treeForm.get('treeValue')?.value;
      newTree.treeTypeName = this.treeForm.get('treeTypeName')?.value;
      newTree.conflictsNames = this.treeForm.get('conflictsNames')?.value;
      newTree.pestsNames = this.treeForm.get('pestsNames')?.value;
      newTree.diseasesNames = this.treeForm.get('diseasesNames')?.value;
      newTree.interventionsNames =
        this.treeForm.get('interventionsNames')?.value;
      newTree.createDefectsDtos = [];
      const addDefect = (
        defectName: string,
        defectValue: number,
        mapping: { [key: number]: string },
        branches?: number
      ) => {
        if (defectValue > 1)
          newTree.createDefectsDtos.push({
            defectName,
            defectValue: +defectValue,
            textDefectValue: mapping[defectValue],
            ...(branches !== undefined && { branches }), // Add branches if it's defined
          });
      };
      addDefect(
        'cuerpos fructiferos de hongos en raices',
        this.treeForm.get('fruitingBodiesOfFungiOnNeckOrRoots')?.value,
        fruitingBodiesOfFungiOnNeckOrRoots
      );
      addDefect(
        'daño mecanico a raices',
        this.treeForm.get('mechanicalDamageToRoots')?.value,
        mechanicalDamageToRoots
      );
      addDefect(
        'raices estrangulantes',
        this.treeForm.get('stranglingRoots')?.value,
        stranglingRoots
      );
      addDefect(
        'raices muertas',
        this.treeForm.get('deadRoots')?.value,
        deadRoots
      );
      addDefect(
        'sintomas de enfermedad radicular en copa',
        this.treeForm.get('symptomsDiseaseOfRootsInCrown')?.value,
        symptomsDiseaseOfRootsInCrown
      );
      addDefect(
        'agallas, termiteros, hormigueros',
        this.treeForm.get('gallsTermiteMoundsAnthills')?.value,
        gallsTermiteMoundsAnthills
      );
      addDefect(
        'cancros de tronco',
        this.treeForm.get('cankersTrunk')?.value,
        cankersTrunk
      );
      addDefect(
        'fustes miltiples',
        this.treeForm.get('multipleTrunks')?.value,
        multipleTrunks
      );
      addDefect(
        'horqueta de tronco',
        this.treeForm.get('forkTrunk')?.value,
        forkTrunk
      );
      addDefect(
        'rajaduras de tronco',
        this.treeForm.get('fissuresTrunk')?.value,
        fissuresTrunk
      );
      addDefect(
        'cancros de rama',
        this.treeForm.get('cankersBranch')?.value,
        cankersBranch
      );
      addDefect(
        'cavidades de rama',
        this.treeForm.get('cavitiesBranches')?.value,
        cavitiesBranches
      );
      addDefect(
        'cuerpos fructiferos de hongos en rama',
        this.treeForm.get('fruitingBodiesOfFungi')?.value,
        fruitingBodiesOfFungi
      );
      addDefect(
        'horqueta de rama',
        this.treeForm.get('forkBranch')?.value,
        forkBranch
      );
      addDefect(
        'ramas colgantes o quebradas',
        this.treeForm.get('hangingOrBrokenBranches')?.value,
        hangingOrBrokenBranches,
        this.treeForm.get('hangingOrBrokenBranches_branches')?.value
      );
      addDefect(
        'ramas muertas',
        this.treeForm.get('deadBranches')?.value,
        deadBranches,
        this.treeForm.get('deadBranches_branches')?.value
      );
      addDefect(
        'ramas sobre extendidas',
        this.treeForm.get('overExtendedBranches')?.value,
        overExtendedBranches
      );
      addDefect(
        'rajaduras de rama',
        this.treeForm.get('fissuresBranches')?.value,
        fissuresBranches
      );
      addDefect(
        'pudricion de madera en ramas',
        this.treeForm.get('woodRot')?.value,
        woodRot
      );
      addDefect(
        'interferencia con red electrica',
        this.treeForm.get('interferenceWithTheElectricalGrid')?.value,
        interferenceWithTheElectricalGrid
      );

      const cavitiesTrunk_t = this.treeForm.get('cavitiesTrunk_t')?.value;
      if (cavitiesTrunk_t && newTree.perimeter) {
        const tr = cavitiesTrunk_t / (newTree.perimeter / 2 / Math.PI);
        console.log(newTree.perimeter / 2 / Math.PI);
        console.log('tr_cavitiestrunk',tr);
        let defectValue: number = 1;
        if (tr < 0.15) defectValue = 4;
        else if (tr < 0.2) defectValue = 3;
        else if (tr < 0.3) defectValue = 2;
        addDefect('cavidades en tronco', defectValue, cavitiesTrunk);
      }
      let slendernessCoefficent_number;
      if (newTree.height && newTree.dch) {
        slendernessCoefficent_number = newTree.height / newTree.dch;
        let defectValue: number = 1;
        if (
          slendernessCoefficent_number > 60 &&
          slendernessCoefficent_number <= 80
        )
          defectValue = 2;
        else if (
          slendernessCoefficent_number > 80 &&
          slendernessCoefficent_number <= 100
        )
          defectValue = 3;
        else if (slendernessCoefficent_number > 100) defectValue = 4;
        addDefect(
          'coeficiente de esbeltez',
          defectValue,
          slendernessCoefficent
        );
      }
      console.log('esbeltez',slendernessCoefficent_number);
      const lostOrDeadBarkWidht = this.treeForm.get(
        'lostOrDeadBark_width'
      )?.value;
      if (lostOrDeadBarkWidht && newTree.perimeter) {
        const lostOrDeadBark_number = lostOrDeadBarkWidht / newTree.perimeter;
        console.log('corteza perdida o muerta',lostOrDeadBark);
        let defectValue: number = 1;
        if (lostOrDeadBark_number < 0.25) defectValue = 2;
        else if (lostOrDeadBark_number < 0.5) defectValue = 3;
        else if (lostOrDeadBark_number > 0.5) defectValue = 4;
        addDefect('corteza perdida o muerta', defectValue, lostOrDeadBark);
      }

      const woundsWidht = this.treeForm.get('wounds_width')?.value;
      if (woundsWidht && newTree.perimeter) {
        const wounds_number = woundsWidht / newTree.perimeter;
        console.log('heridas',wounds_number);
        let defectValue: number = 1;
        if (wounds_number < 0.5) defectValue = 3;
        else if (wounds_number > 0.5) defectValue = 4;
        addDefect('heridas de tronco', defectValue, wounds);
      }

      if (newTree.incline) {
        let defectValue: number = 1;
        if (newTree.incline >= 10 && newTree.incline < 20) defectValue = 2;
        else if (newTree.incline >= 20 && newTree.incline < 30) defectValue = 3;
        else if (newTree.incline >= 30) defectValue = 4;
        addDefect('inclinacion', defectValue, inclination);
      }
      if (this.treeForm.get('isWoodRoot')?.value) {
        let t = this.treeForm.get('woodRoot_t')?.value;
        let defectValue: number = 1;
        console.log(
          't_woodroot, perimeter, coef_esbeltez',
          t,
          newTree.perimeter,
          slendernessCoefficent_number
        );
        if (this.treeForm.get('isWoodRoot_fruitingBodies')?.value)
          defectValue = 4;
        else if (t && newTree.perimeter && slendernessCoefficent_number) {
          const tr = t / (newTree.perimeter / (2 * Math.PI)); // t/R
          if (tr < 0.15 && slendernessCoefficent_number > 60) defectValue = 3;
          else if (tr < 0.2 && slendernessCoefficent_number > 60)
            defectValue = 2;
        }
        addDefect('pudricion de madera en tronco', defectValue, woodRotTrunk);
      }

      console.log('defectos: ',newTree.createDefectsDtos);
      const defectValues = newTree.createDefectsDtos.map(
        (createDefectDto) => createDefectDto.defectValue
      );
      let maxDefectValue = defectValues.length
        ? Math.max(...defectValues)
        : null;

      if (maxDefectValue) newTree.risk += maxDefectValue;
      else newTree.risk += 1;
      if (newTree.windExposure == 'parcialmente expuesto') newTree.risk += 1;
      if (newTree.windExposure == 'expuesto') newTree.risk += 2;
      if (newTree.windExposure == 'tunel de viento') newTree.risk += 2;
      if (newTree.canopyDensity == 'escasa') newTree.risk -= 1;
      if (newTree.canopyDensity == 'densa') newTree.risk += 1;
      if (newTree.frequencyUse) newTree.risk += newTree.frequencyUse;
      if (newTree.potentialDamage) newTree.risk += newTree.potentialDamage;

      console.log('maxDefectValue',maxDefectValue);
      console.log('  risk', newTree.risk );

      newTree.createDefectsDtos = newTree.createDefectsDtos.filter(
        (createDefectDto) => createDefectDto.defectValue > 1
      );
    } // end if

    if (this.image) newTree.photoFile = this.image.dataUrl?.split(',')[1];
    console.log('newTree', newTree);

    this.treeService.createOrUpdateTree(newTree, this.idTree).subscribe({
      next: (idTree) => {
        this.uiService.alert(`${this.operation} exitosa`, 'Éxito');
        this.router.navigate(
          [
            `/project/${this.idProject}/tree/${
              this.projectType ? 'muestreo' : 'individual'
            }/detailtree/${idTree}`,
          ],
          { replaceUrl: true }
        );
      },
      error: () => this.uiService.alert(this.operation + ' fallida', 'Error'),
    });
  }

  private updateSelectedDefectsSummary(): void {
    const summary: { label: string; value: string }[] = [];

    const defectFields = [
      {
        control: 'fruitingBodiesOfFungiOnNeckOrRoots',
        entries: this.fruitingBodiesOfFungiOnNeckOrRootsEntries,
        label: 'Cuerpos fructíferos de hongos en cuello o raíces',
      },
      {
        control: 'mechanicalDamageToRoots',
        entries: this.mechanicalDamageToRootsEntries,
        label: 'Daño mecánico a raíces',
      },
      {
        control: 'stranglingRoots',
        entries: this.stranglingRootsEntries,
        label: 'Raíces estrangulantes',
      },
      {
        control: 'deadRoots',
        entries: this.deadRootsEntries,
        label: 'Raíces muertas',
      },
      {
        control: 'symptomsDiseaseOfRootsInCrown',
        entries: this.symptomsDiseaseOfRootsInCrownEntries,
        label: 'Síntomas de enfermedad radicular en copa',
      },
      {
        control: 'gallsTermiteMoundsAnthills',
        entries: this.gallsTermiteMoundsAnthillsEntries,
        label: 'Agallas, termiteros, hormigueros',
      },
      {
        control: 'cankersTrunk',
        entries: this.cankersTrunkEntries,
        label: 'Cancros de tronco o cuello',
      },
      {
        control: 'multipleTrunks',
        entries: this.multipleTrunksEntries,
        label: 'Fustes múltiples',
      },
      {
        control: 'forkTrunk',
        entries: this.forkTrunkEntries,
        label: 'Horqueta de tronco',
      },
      {
        control: 'fissuresTrunk',
        entries: this.fissuresTrunkEntries,
        label: 'Rajaduras de tronco',
      },
      {
        control: 'cankersBranch',
        entries: this.cankersBranchEntries,
        label: 'Cancros de ramas',
      },
      {
        control: 'cavitiesBranches',
        entries: this.cavitiesBranchesEntries,
        label: 'Cavidades en ramas',
      },
      {
        control: 'fruitingBodiesOfFungi',
        entries: this.fruitingBodiesOfFungiEntries,
        label: 'Cuerpos fructíferos de hongos en ramas',
      },
      {
        control: 'forkBranch',
        entries: this.forkBranchEntries,
        label: 'Horqueta de ramas',
      },
      {
        control: 'hangingOrBrokenBranches',
        entries: this.hangingOrBrokenBranchesEntries,
        label: 'Ramas colgantes o quebradas',
      },
      {
        control: 'deadBranches',
        entries: this.deadBranchesEntries,
        label: 'Ramas muertas',
      },
      {
        control: 'overExtendedBranches',
        entries: this.overExtendedBranchesEntries,
        label: 'Ramas sobre extendidas',
      },
      {
        control: 'fissuresBranches',
        entries: this.fissuresBranchesEntries,
        label: 'Rajaduras',
      },
      {
        control: 'woodRot',
        entries: this.woodRotEntries,
        label: 'Pudrición de madera',
      },
      {
        control: 'interferenceWithTheElectricalGrid',
        entries: this.interferenceWithTheElectricalGridEntries,
        label: 'Interferencia con red eléctrica',
      },
    ];

    for (const field of defectFields) {
      const value = this.treeForm.get(field.control)?.value;
      if (value) {
        const entry = field.entries.find(([key]) => key == value);
        if (entry) {
          summary.push({ label: field.label, value: entry[1] });
        }
      }
    }

    // Special cases for checkboxes and inputs
    if (
      this.treeForm.get('isCavitiesTrunk')?.value &&
      this.treeForm.get('cavitiesTrunk_t')?.value
    ) {
      summary.push({
        label: 'Cavidades en tronco',
        value: 't = ' + this.treeForm.get('cavitiesTrunk_t')?.value,
      });
    }
    if (
      this.treeForm.get('isLostOrDeadBark')?.value &&
      this.treeForm.get('lostOrDeadBark_width')?.value
    ) {
      summary.push({
        label: 'Corteza pérdida o muerta',
        value: 'ancho = ' + this.treeForm.get('lostOrDeadBark_width')?.value,
      });
    }
    if (
      this.treeForm.get('isWounds')?.value &&
      this.treeForm.get('wounds_width')?.value
    ) {
      summary.push({
        label: 'Heridas en el tronco',
        value: 'ancho = ' + this.treeForm.get('wounds_width')?.value,
      });
    }
    if (this.treeForm.get('isWoodRoot')?.value) {
      if (this.treeForm.get('isWoodRoot_fruitingBodies')?.value) {
        summary.push({
          label: 'Pudrición de madera',
          value: 'con cuerpos fructíferos',
        });
      } else if (this.treeForm.get('woodRoot_t')?.value) {
        summary.push({
          label: 'Pudrición de madera',
          value: 't = ' + this.treeForm.get('woodRoot_t')?.value,
        });
      }
    }
    if (
      this.hangingOrBrokenBranches_branches &&
      this.treeForm.get('hangingOrBrokenBranches_branches')?.value
    ) {
      summary.push({
        label: 'Número de ramas colgantes o quebradas',
        value: this.treeForm.get('hangingOrBrokenBranches_branches')?.value,
      });
    }
    if (
      this.deadBranches_branches &&
      this.treeForm.get('deadBranches_branches')?.value
    ) {
      summary.push({
        label: 'Número de ramas muertas',
        value: this.treeForm.get('deadBranches_branches')?.value,
      });
    }

    this.selectedDefectsSummary = summary;
  }
}
