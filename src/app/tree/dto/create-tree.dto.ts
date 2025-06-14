import { CreateDefectTreeDto } from './create-defect-tree.dto';

export class CreateTreeDto {
  datetime?: Date;
  photoFileName?: string | null;
  photoFile?: string;
  cityBlock!: number;
  perimeter?: number | null;
  height?: number | null;
  incline?: number | null;
  treesInTheBlock?: number | null;
  useUnderTheTree?: string;
  frequencyUse?: number | null;
  potentialDamage?: number | null;
  isMovable?: boolean | null;
  isRestrictable?: boolean | null;
  isMissing?: boolean | null;
  isDead?: boolean | null;
  exposedRoots?: boolean | null;
  dch?: number | null;
  windExposure?: string | null;
  vigor?: string | null;
  canopyDensity?: string | null;
  growthSpace?: string | null;
  treeValue?: string | null;
  streetMateriality?: string;
  risk?: number | null;
  address!: string;
  conflictsNames?: string[];
  createDefectDto!: CreateDefectTreeDto[];
  diseasesNames?: string[];
  interventionsNames?: string[];
  pestsNames?: string[];
  latitude!: number;
  longitude!: number;
  treeTypeName?: string;
  projectId!: number;
}
