import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { TreeService } from '../tree.service';
import { Location } from '@angular/common';
import { CreateTreeDto } from '../dto/create-tree.dto';
import { ReadTreeDto } from '../dto/read-tree.dto';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { UiService } from '../../utils/ui.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';

// Interface for tree type with genus information
interface TreeType {
  name: string;
  genus: string;
}
import {
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
} from '../../constants/defects-text-level-list';
import {
  windExposureOptions,
  vigorOptions,
  canopyDensityOptions,
  growthSpaceOptions,
  treeValueOptions,
  frequencyUseOptions,
  potentialDamageOptions,
  conflictOptions,
  interventionOptions,
} from '../../constants/options-list';
import { ReadDefectTreeDto } from '../dto/read-defect-tree.dto';

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
  treeTypeOptions: TreeType[] = [];
  filteredTreeTypes: TreeType[] = [];
  selectedTreeType: TreeType | null = null; // Store the selected tree type
  showSuggestions: boolean = false;
  isSelectingFromList: boolean = false;
  conflictOptions = conflictOptions;
  interventionOptions = interventionOptions;
  treeInfoCollectionStartTime: Date = new Date();
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
  // Zone-based defect arrays
  selectedDefectsRaiz: { label: string; value: string }[] = [];
  selectedDefectsTronco: { label: string; value: string }[] = [];
  selectedDefectsRama: { label: string; value: string }[] = [];
  private idProject!: number;
  idTree: number | null = null;
  projectType!: string | null;
  treeForm: FormGroup;
  private dch!: number;
  hangingOrBrokenBranches_branches: boolean = false;
  deadBranches_branches: boolean = false;
  showWarning: boolean = false;
  operation: string = 'Registración';
  image: any;
  tiltValues = 0;
  heightValues = 0;
  height: number = 0;
  currentPhoto: string | null = null;

  onTiltChange(event: number) {
    this.tiltValues = event;
    this.treeForm.get('incline')?.setValue(Number(event.toFixed(2)));
  }
  onHeightChange(event: number) {
    this.heightValues = event;
    this.treeForm.get('height')?.setValue(Number(event.toFixed(2)));
  }
  constructor(
    private route: ActivatedRoute,
    private treeService: TreeService,
    private router: Router,
    private fb: FormBuilder,
    private uiService: UiService,
    private http: HttpClient,
    private location: Location
  ) {
    this.treeForm = this.fb.group({
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
      useCurrentPosition: [false],
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
      this.projectType = params.get('projectType');
      if (params.get('idTree') !== '0') this.idTree = +params.get('idTree')!;
      this.operation = this.idTree ? 'Actualización' : 'Registración';
      console.log(this.idTree);
    });

    this.treeForm.valueChanges.pipe(debounceTime(100)).subscribe(() => {
      this.updateSelectedDefectsSummary();
    });

    // Load tree types from JSON file first, then load existing tree data if updating
    this.loadTreeTypes();

    // Set up autocomplete for tree type
    this.treeForm
      .get('treeTypeName')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe((value) => {
        if (!this.isSelectingFromList) {
          // Reset selected tree type when user types manually
          this.selectedTreeType = null;
          this.filterTreeTypes(value || '');
          this.showSuggestions = !!(
            value?.trim().length > 0 && this.filteredTreeTypes.length > 0
          );
        }
        this.isSelectingFromList = false;
      });
    if (this.idTree) {
      this.loadExistingTreeData();
    }
  }

  private loadTreeTypes() {
    this.http.get<TreeType[]>('assets/tree-types.json').subscribe({
      next: (treeTypes) => {
        this.treeTypeOptions = treeTypes;
        this.filteredTreeTypes = [...treeTypes];
      },
    });
  }

  filterTreeTypes(searchText: string) {
    if (!searchText || searchText.trim() === '') {
      this.filteredTreeTypes = [];
    } else {
      const filterValue = searchText.toLowerCase();
      // Don't show suggestions if the input exactly matches an existing tree type
      const exactMatch = this.treeTypeOptions.find(
        (treeType) => treeType.name.toLowerCase() === filterValue
      );

      if (exactMatch) {
        this.filteredTreeTypes = [];
      } else {
        this.filteredTreeTypes = this.treeTypeOptions
          .filter((treeType) =>
            treeType.name.toLowerCase().includes(filterValue)
          )
          .slice(0, 10); // Limit to 10 suggestions for better UX
      }
    }
  }

  onTreeTypeSelect(treeType: TreeType) {
    this.isSelectingFromList = true;
    this.treeForm.get('treeTypeName')?.setValue(treeType.name);
    this.selectedTreeType = treeType; // Set the selected tree type
    this.showSuggestions = false;
    this.filteredTreeTypes = [];
  }

  onTreeTypeInputFocus() {
    const currentValue = this.treeForm.get('treeTypeName')?.value;
    if (currentValue && currentValue.trim().length > 0) {
      this.filterTreeTypes(currentValue);
      this.showSuggestions = this.filteredTreeTypes.length > 0;
    }
  }

  onTreeTypeInputBlur() {
    // Delay hiding suggestions to allow for click events on suggestions
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
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
      if (perimeterValue) this.dch = perimeterValue / Math.PI / 100; // Convert to meters
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
      'potentialDamage',
      'windExposure',
      'vigor',
      'canopyDensity',
      'growthSpace',
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

    this.treeForm
      .get('nothingUnderTree')
      ?.setValue(this.treeForm.get('nothingUnderTree'));

    if (condition) {
      this.treeForm.get('treeValue')?.clearValidators();
      this.treeForm.get('treesInTheBlock')?.clearValidators();
    } else {
      if (this.projectType === 'muestreo') {
        this.treeForm.get('treeValue')?.clearValidators();
        this.treeForm
          .get('treesInTheBlock')
          ?.setValidators([Validators.required]);
      } else {
        this.treeForm.get('treesInTheBlock')?.clearValidators();
        this.treeForm.get('treeValue')?.setValidators([Validators.required]);
      }
    }
    this.treeForm.get('treeValue')?.updateValueAndValidity();
    this.treeForm.get('treesInTheBlock')?.updateValueAndValidity();
  }

  async getLocation() {
    try {
      // Use high accuracy options
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Update form values with coordinates
      this.treeForm.patchValue({
        latitude: lat,
        longitude: lon,
      });

      // Get address from coordinates using reverse geocoding
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      const response = await firstValueFrom(this.http.get<any>(url));

      if (response?.display_name) {
        this.treeForm.patchValue({
          address: response.display_name,
        });
      }
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
  get diseasesNames() {
    return this.treeForm.get('diseasesNames') as FormArray;
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
    } catch (error: any) {
      // Don't show error if user cancelled - this is normal behavior
      if (error?.message && !error.message.toLowerCase().includes('cancel')) {
        this.uiService.alert('Error al tomar la foto', 'Error');
      }
      // If user cancelled, just do nothing (no error message needed)
    }
  }

  removePhoto() {
    this.image = null;
  }

  async onSubmit() {
    console.log(
      '🚀 ~ CreateTreeComponent ~ createTree ~ this.selectedTreeType:',
      this.selectedTreeType
    );
    if (this.treeForm.valid) {
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
    newTree.cityBlock = this.treeForm.get('cityBlock')?.value;
    newTree.address = this.treeForm.get('address')?.value;
    newTree.latitude = this.treeForm.get('latitude')?.value;
    newTree.longitude = this.treeForm.get('longitude')?.value;
    newTree.treesInTheBlock = this.treeForm.get('treesInTheBlock')?.value;
    newTree.treeInfoCollectionStartTime = this.treeInfoCollectionStartTime;

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
      newTree.treeTypeName = this.treeForm
        .get('treeTypeName')
        ?.value.toLowerCase();

      // Set gender (genus) information if we have a selected tree type
      if (this.selectedTreeType) {
        newTree.gender = this.selectedTreeType.genus;
      } else {
        // If no selected tree type (manual entry), try to find genus from tree type options
        const treeTypeName = this.treeForm.get('treeTypeName')?.value;
        const foundTreeType = this.treeTypeOptions.find(
          (tt) => tt.name.toLowerCase() === treeTypeName?.toLowerCase()
        );
        newTree.gender = foundTreeType?.genus;
      }

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
        'pudricion de madera en rama',
        this.treeForm.get('woodRot')?.value,
        woodRot
      );
      addDefect(
        'interferencia con red electrica',
        this.treeForm.get('interferenceWithTheElectricalGrid')?.value,
        interferenceWithTheElectricalGrid
      );

      const cavitiesTrunk_t = this.treeForm.get('cavitiesTrunk_t')?.value;
      const isCavitiesTrunk = this.treeForm.get('isCavitiesTrunk')?.value;
      if (isCavitiesTrunk && cavitiesTrunk_t && newTree.perimeter) {
        const tr = cavitiesTrunk_t / (newTree.perimeter / 2 / Math.PI); // t/R
        console.log(newTree.perimeter / 2 / Math.PI);
        console.log('tr_cavitiestrunk', tr);
        let defectValue: number = 1;
        if (tr < 0.15) defectValue = 4;
        else if (tr < 0.2) defectValue = 3;
        else if (tr < 0.3) defectValue = 2;
        addDefect(
          'cavidades en tronco',
          defectValue,
          cavitiesTrunk,
          cavitiesTrunk_t
        );
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
      console.log('esbeltez', slendernessCoefficent_number);
      const lostOrDeadBark_width = this.treeForm.get(
        'lostOrDeadBark_width'
      )?.value;
      const isLostOrDeadBark = this.treeForm.get('isLostOrDeadBark')?.value;
      if (isLostOrDeadBark && lostOrDeadBark_width && newTree.perimeter) {
        const lostOrDeadBark_number = lostOrDeadBark_width / newTree.perimeter;
        console.log('corteza perdida o muerta', lostOrDeadBark);
        let defectValue: number = 1;
        if (lostOrDeadBark_number < 0.25) defectValue = 2;
        else if (lostOrDeadBark_number < 0.5) defectValue = 3;
        else if (lostOrDeadBark_number > 0.5) defectValue = 4;
        addDefect(
          'corteza perdida o muerta',
          defectValue,
          lostOrDeadBark,
          lostOrDeadBark_width
        );
      }

      const wounds_width = this.treeForm.get('wounds_width')?.value;
      const isWounds = this.treeForm.get('isWounds')?.value;
      if (isWounds && wounds_width && newTree.perimeter) {
        const wounds_number = wounds_width / newTree.perimeter;
        console.log('heridas', wounds_number);
        let defectValue: number = 1;
        if (wounds_number < 0.5) defectValue = 3;
        else if (wounds_number > 0.5) defectValue = 4;
        addDefect('heridas de tronco', defectValue, wounds, wounds_width);
      }

      if (newTree.incline) {
        let defectValue: number = 1;
        if (newTree.incline >= 10 && newTree.incline < 20) defectValue = 2;
        else if (newTree.incline >= 20 && newTree.incline < 30) defectValue = 3;
        else if (newTree.incline >= 30) defectValue = 4;
        addDefect('inclinacion', defectValue, inclination);
      }
      const isWoodRoot = this.treeForm.get('isWoodRoot')?.value;
      const woodRoot_t = this.treeForm.get('woodRoot_t')?.value;
      const isWoodRoot_fruitingBodies = this.treeForm.get(
        'isWoodRoot_fruitingBodies'
      )?.value;
      if (isWoodRoot) {
        let defectValue: number = 1;
        console.log(
          't_woodroot, perimeter, coef_esbeltez',
          woodRoot_t,
          newTree.perimeter,
          slendernessCoefficent_number
        );
        if (isWoodRoot_fruitingBodies) {
          defectValue = 4;
        } else if (
          woodRoot_t &&
          newTree.perimeter &&
          slendernessCoefficent_number
        ) {
          const tr = woodRoot_t / (newTree.perimeter / (2 * Math.PI)); // t/R
          if (tr < 0.15 && slendernessCoefficent_number > 60) defectValue = 3;
          else if (tr < 0.2 && slendernessCoefficent_number > 60)
            defectValue = 2;
        }
        addDefect(
          'pudricion de madera en tronco',
          defectValue,
          woodRotTrunk,
          woodRoot_t
        );
      }

      console.log('defectos: ', newTree.createDefectsDtos);
      const defectValues = newTree.createDefectsDtos.map(
        (createDefectDto) => createDefectDto.defectValue
      );
      const maxDefectValue = defectValues.length
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

      console.log('maxDefectValue', maxDefectValue);
      console.log('risk', newTree.risk);

      newTree.createDefectsDtos = newTree.createDefectsDtos.filter(
        (createDefectDto) => createDefectDto.defectValue > 1
      );
    } // end if

    newTree.photoFile = this.image?.dataUrl?.split(',')[1] || null;
    newTree.currentPhoto = this.currentPhoto || null;

    console.log('newTree', newTree);
    this.treeService.createOrUpdateTree(newTree, this.idTree).subscribe({
      next: (idTree) => {
        if (this.idTree) {
          this.location.back();
        } else {
          this.router.navigate(
            [
              `/project/${this.idProject}/tree/${this.projectType}/detailtree/${idTree}`,
            ],
            { replaceUrl: true }
          );
        }
        this.uiService.alert(`${this.operation} exitosa ✅`, 'Éxito');
      },
      error: () => this.uiService.alert(this.operation + ' fallida', 'Error'),
    });
  }

  private updateSelectedDefectsSummary(): void {
    const raizDefects: { label: string; value: string }[] = [];
    const troncoDefects: { label: string; value: string }[] = [];
    const ramaDefects: { label: string; value: string }[] = [];

    const defectFields = [
      // DEFECTOS EN RAÍCES
      {
        control: 'fruitingBodiesOfFungiOnNeckOrRoots',
        entries: this.fruitingBodiesOfFungiOnNeckOrRootsEntries,
        label: 'Cuerpos fructíferos de hongos en cuello o raíces',
        zone: 'raiz',
      },
      {
        control: 'mechanicalDamageToRoots',
        entries: this.mechanicalDamageToRootsEntries,
        label: 'Daño mecánico a raíces',
        zone: 'raiz',
      },
      {
        control: 'stranglingRoots',
        entries: this.stranglingRootsEntries,
        label: 'Raíces estrangulantes',
        zone: 'raiz',
      },
      {
        control: 'deadRoots',
        entries: this.deadRootsEntries,
        label: 'Raíces muertas',
        zone: 'raiz',
      },
      {
        control: 'symptomsDiseaseOfRootsInCrown',
        entries: this.symptomsDiseaseOfRootsInCrownEntries,
        label: 'Síntomas de enfermedad radicular en copa',
        zone: 'raiz',
      },
      // DEFECTOS EN TRONCO
      {
        control: 'gallsTermiteMoundsAnthills',
        entries: this.gallsTermiteMoundsAnthillsEntries,
        label: 'Agallas, termiteros, hormigueros',
        zone: 'tronco',
      },
      {
        control: 'cankersTrunk',
        entries: this.cankersTrunkEntries,
        label: 'Cancros de tronco o cuello',
        zone: 'tronco',
      },
      {
        control: 'multipleTrunks',
        entries: this.multipleTrunksEntries,
        label: 'Fustes múltiples',
        zone: 'tronco',
      },
      {
        control: 'forkTrunk',
        entries: this.forkTrunkEntries,
        label: 'Horqueta de tronco',
        zone: 'tronco',
      },
      {
        control: 'fissuresTrunk',
        entries: this.fissuresTrunkEntries,
        label: 'Rajaduras de tronco',
        zone: 'tronco',
      },
      // DEFECTOS EN RAMAS
      {
        control: 'cankersBranch',
        entries: this.cankersBranchEntries,
        label: 'Cancros de ramas',
        zone: 'rama',
      },
      {
        control: 'cavitiesBranches',
        entries: this.cavitiesBranchesEntries,
        label: 'Cavidades en ramas',
        zone: 'rama',
      },
      {
        control: 'fruitingBodiesOfFungi',
        entries: this.fruitingBodiesOfFungiEntries,
        label: 'Cuerpos fructíferos de hongos en ramas',
        zone: 'rama',
      },
      {
        control: 'forkBranch',
        entries: this.forkBranchEntries,
        label: 'Horqueta de rama',
        zone: 'rama',
      },
      {
        control: 'hangingOrBrokenBranches',
        entries: this.hangingOrBrokenBranchesEntries,
        label: 'Ramas colgantes o quebradas',
        zone: 'rama',
      },
      {
        control: 'deadBranches',
        entries: this.deadBranchesEntries,
        label: 'Ramas muertas',
        zone: 'rama',
      },
      {
        control: 'overExtendedBranches',
        entries: this.overExtendedBranchesEntries,
        label: 'Ramas sobre extendidas',
        zone: 'rama',
      },
      {
        control: 'fissuresBranches',
        entries: this.fissuresBranchesEntries,
        label: 'Rajaduras de ramas',
        zone: 'rama',
      },
      {
        control: 'woodRot',
        entries: this.woodRotEntries,
        label: 'Pudrición de madera',
        zone: 'rama',
      },
      {
        control: 'interferenceWithTheElectricalGrid',
        entries: this.interferenceWithTheElectricalGridEntries,
        label: 'Interferencia con red eléctrica',
        zone: 'rama',
      },
    ];

    // Process each defect field and assign to the appropriate zone
    for (const field of defectFields) {
      const value = this.treeForm.get(field.control)?.value;
      if (value) {
        const entry = field.entries.find(([key]) => key == value);
        if (entry) {
          let defectValue = entry[1];

          // For branch-related defects, append the count if available
          if (
            field.control === 'hangingOrBrokenBranches' &&
            this.hangingOrBrokenBranches_branches &&
            this.treeForm.get('hangingOrBrokenBranches_branches')?.value
          ) {
            defectValue += ` (${
              this.treeForm.get('hangingOrBrokenBranches_branches')?.value
            })`;
          } else if (
            field.control === 'deadBranches' &&
            this.deadBranches_branches &&
            this.treeForm.get('deadBranches_branches')?.value
          ) {
            defectValue += ` (${
              this.treeForm.get('deadBranches_branches')?.value
            })`;
          }

          const defectItem = { label: field.label, value: defectValue };

          switch (field.zone) {
            case 'raiz':
              raizDefects.push(defectItem);
              break;
            case 'tronco':
              troncoDefects.push(defectItem);
              break;
            case 'rama':
              ramaDefects.push(defectItem);
              break;
          }
        }
      }
    }

    // Special cases for checkboxes and inputs - assign to appropriate zones

    // Incline defect (tronco zone)
    const inclineValue = this.treeForm.get('incline')?.value;
    if (inclineValue) {
      let inclineDefectValue = 1;

      if (inclineValue >= 10 && inclineValue < 20) {
        inclineDefectValue = 2;
      } else if (inclineValue >= 20 && inclineValue < 30) {
        inclineDefectValue = 3;
      } else if (inclineValue >= 30) {
        inclineDefectValue = 4;
      }

      if (inclineDefectValue > 1) {
        troncoDefects.push({
          label: 'Inclinación',
          value: `${inclineValue}° - riesgo: ${inclineDefectValue}`,
        });
      }
    }

    if (
      this.treeForm.get('isCavitiesTrunk')?.value &&
      this.treeForm.get('cavitiesTrunk_t')?.value
    ) {
      troncoDefects.push({
        label: 'Cavidades en tronco',
        value: 't = ' + this.treeForm.get('cavitiesTrunk_t')?.value,
      });
    }
    if (
      this.treeForm.get('isLostOrDeadBark')?.value &&
      this.treeForm.get('lostOrDeadBark_width')?.value
    ) {
      troncoDefects.push({
        label: 'Corteza pérdida o muerta',
        value: 'ancho = ' + this.treeForm.get('lostOrDeadBark_width')?.value,
      });
    }
    if (
      this.treeForm.get('isWounds')?.value &&
      this.treeForm.get('wounds_width')?.value
    ) {
      troncoDefects.push({
        label: 'Heridas en el tronco',
        value: 'ancho = ' + this.treeForm.get('wounds_width')?.value,
      });
    }
    if (this.treeForm.get('isWoodRoot')?.value) {
      if (this.treeForm.get('isWoodRoot_fruitingBodies')?.value) {
        troncoDefects.push({
          label: 'Pudrición de madera',
          value: 'con cuerpos fructíferos',
        });
      } else if (this.treeForm.get('woodRoot_t')?.value) {
        troncoDefects.push({
          label: 'Pudrición de madera',
          value: 't = ' + this.treeForm.get('woodRoot_t')?.value,
        });
      }
    }

    // Slenderness coefficient defect (tronco zone)
    const heightValue = this.treeForm.get('height')?.value;

    if (heightValue && this.dch) {
      const slendernessCoefficent_number = heightValue / this.dch;
      let slendernessDefectValue = 1;

      if (
        slendernessCoefficent_number > 60 &&
        slendernessCoefficent_number <= 80
      ) {
        slendernessDefectValue = 2;
      } else if (
        slendernessCoefficent_number > 80 &&
        slendernessCoefficent_number <= 100
      ) {
        slendernessDefectValue = 3;
      } else if (slendernessCoefficent_number > 100) {
        slendernessDefectValue = 4;
      }

      if (slendernessDefectValue > 1) {
        troncoDefects.push({
          label: 'Coeficiente de esbeltez',
          value: `${slendernessCoefficent_number.toFixed(
            1
          )} - riesgo: ${slendernessDefectValue}`,
        });
      }
    }

    // Update zone-specific arrays
    this.selectedDefectsRaiz = raizDefects;
    this.selectedDefectsTronco = troncoDefects;
    this.selectedDefectsRama = ramaDefects;
  }

  // Helper method to check if a form control has a value (not null, undefined, empty string, or false for checkboxes)
  hasValue(controlName: string): boolean {
    const control = this.treeForm.get(controlName);
    if (!control) return false;

    const value = control.value;

    // For checkboxes, consider true as having a value
    if (typeof value === 'boolean') {
      return value === true;
    }

    // For arrays (like FormArray), check if it has items
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    // For strings and numbers, check if not null, undefined, or empty string
    return value !== null && value !== undefined && value !== '';
  }

  // Helper method to check if a FormArray control at specific index has a value
  hasArrayValue(arrayName: string, index: number): boolean {
    const array = this.treeForm.get(arrayName) as FormArray;
    if (!array || !array.at(index)) return false;

    const value = array.at(index).value;
    return value !== null && value !== undefined && value !== '';
  }

  private loadExistingTreeData() {
    // Only load if idTree exists
    if (!this.idTree) {
      return;
    }

    this.uiService.cargando(true);
    this.treeService.getTreeById(this.idTree).subscribe({
      next: (tree) => {
        this.uiService.cargando(false);
        this.populateFormWithTreeData(tree);
      },
      error: (error) => {
        this.uiService.cargando(false);
        console.error('Error loading tree data:', error);
        this.uiService.alert('No se pudo cargar los datos del árbol.', 'Error');
      },
    });
  }

  private populateFormWithTreeData(tree: ReadTreeDto) {
    // Basic form fields
    this.treeForm.patchValue({
      cityBlock: tree.cityBlock,
      perimeter: +tree.perimeter,
      height: +tree.height,
      incline: +tree.incline,
      treesInTheBlock: tree.treesInTheBlock,
      useUnderTheTree: tree.useUnderTheTree,
      frequencyUse: +tree.frequencyUse,
      potentialDamage: +tree.potentialDamage,
      isMovable: tree.isMovable,
      isRestrictable: tree.isRestrictable,
      isMissing: tree.isMissing,
      isDead: tree.isDead,
      exposedRoots: tree.exposedRoots,
      windExposure: tree.windExposure,
      vigor: tree.vigor,
      canopyDensity: tree.canopyDensity,
      growthSpace: tree.growthSpace,
      treeValue: tree.treeValue,
      address: tree.address,
      latitude: +tree.latitude,
      longitude: +tree.longitude,
      useCurrentPosition: !!(tree.latitude && tree.longitude),
      treeTypeName: tree.treeTypeName,
      nothingUnderTree: !tree.useUnderTheTree,
      conflictsNames: tree.conflictsNames || [],
      interventionsNames: tree.interventionsNames || [],
    });
    // Set selected tree type if available
    if (tree.treeTypeName) {
      const foundTreeType = this.treeTypeOptions.find(
        (tt) => tt.name.toLowerCase() === tree.treeTypeName!.toLowerCase()
      );
      if (foundTreeType) {
        this.selectedTreeType = foundTreeType;
      }
    }
    if (!tree.useUnderTheTree) {
      this.treeForm.get('useUnderTheTree')?.clearValidators();
      this.treeForm.get('useUnderTheTree')?.updateValueAndValidity();
      this.treeForm.get('frequencyUse')?.clearValidators();
      this.treeForm.get('frequencyUse')?.updateValueAndValidity();
    }

    // Store the existing photo filename
    this.currentPhoto = tree.pathPhoto;

    // Handle FormArrays
    tree.diseasesNames.forEach((value) => {
      (this as any)['diseasesNames'].push(
        this.fb.control(value, Validators.required)
      );
    });
    tree.pestsNames.forEach((value) => {
      (this as any)['pestsNames'].push(
        this.fb.control(value, Validators.required)
      );
    });
    // Handle defects - extract values from ReadDefectTreeDto and set form controls
    this.populateDefectsFromReadDefectDto(tree.readDefectDto);
  }

  private populateDefectsFromReadDefectDto(defects: ReadDefectTreeDto[]) {
    // Map defect names to form control names
    const defectMappings: { [key: string]: string } = {
      'cuerpos fructiferos de hongos en raices':
        'fruitingBodiesOfFungiOnNeckOrRoots',
      'daño mecanico a raices': 'mechanicalDamageToRoots',
      'raices estrangulantes': 'stranglingRoots',
      'raices muertas': 'deadRoots',
      'sintomas de enfermedad radicular en copa':
        'symptomsDiseaseOfRootsInCrown',
      'agallas, termiteros, hormigueros': 'gallsTermiteMoundsAnthills',
      'cancros de tronco': 'cankersTrunk',
      'fustes miltiples': 'multipleTrunks',
      'horqueta de tronco': 'forkTrunk',
      'rajaduras de tronco': 'fissuresTrunk',
      'cancros de rama': 'cankersBranch',
      'cavidades de rama': 'cavitiesBranches',
      'cuerpos fructiferos de hongos en rama': 'fruitingBodiesOfFungi',
      'horqueta de rama': 'forkBranch',
      'ramas colgantes o quebradas': 'hangingOrBrokenBranches',
      'ramas muertas': 'deadBranches',
      'ramas sobre extendidas': 'overExtendedBranches',
      'rajaduras de rama': 'fissuresBranches',
      'pudricion de madera en rama': 'woodRot',
      'interferencia con red electrica': 'interferenceWithTheElectricalGrid',
    };

    defects.forEach((defect) => {
      const formControlName = defectMappings[defect.defectName];
      if (formControlName) {
        // Convert numeric value to string to match ion-select option values
        this.treeForm
          .get(formControlName)
          ?.setValue(defect.defectValue.toString());

        // Handle special cases with branches
        if (
          defect.branches &&
          (formControlName === 'hangingOrBrokenBranches' ||
            formControlName === 'deadBranches')
        ) {
          this.treeForm
            .get(formControlName + '_branches')
            ?.setValue(defect.branches);
          (this as any)[formControlName + '_branches'] = true; // Enable branches input
        }
      }
      // Handle special defects that don't map directly to standard form controls
      if (defect.defectName === 'cavidades en tronco') {
        this.treeForm.get('isCavitiesTrunk')?.setValue(true);
        this.treeForm.get('cavitiesTrunk_t')?.setValue(defect.branches);
      }
      if (defect.defectName === 'corteza perdida o muerta') {
        this.treeForm.get('isLostOrDeadBark')?.setValue(true);
        this.treeForm.get('lostOrDeadBark_width')?.setValue(defect.branches);
      }
      if (defect.defectName === 'heridas de tronco') {
        this.treeForm.get('isWounds')?.setValue(true);
        this.treeForm.get('wounds_width')?.setValue(defect.branches);
      }
      if (defect.defectName === 'pudricion de madera en tronco') {
        this.treeForm.get('isWoodRoot')?.setValue(true);
        if (defect.textDefectValue === 'presencia de cuerpos fructiferos') {
          this.treeForm.get('isWoodRoot_fruitingBodies')?.setValue(true);
        } else {
          this.treeForm.get('woodRoot_t')?.setValue(defect.branches);
        }
      }
    });
  }
}
