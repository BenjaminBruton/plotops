/**
 * @plotops/business-logic - Core business rules and calculations for PlotOps
 * 
 * This package contains the core business logic including script parsing,
 * scene clustering algorithms, budget calculations, schedule optimization,
 * and production progress tracking.
 */

import type {
  Project,
  Scene,
  Character,
  Actor,
  Location,
  Asset,
  ScheduleItem,
  SceneStatus,
  ProjectStatus,
  CharacterType,
  AssetType,
  LocationType
} from '@plotops/types';
import { 
  groupBy, 
  sortBy, 
  formatCurrency, 
  getDaysBetween,
  isWeekend,
  addDays,
  calculateSceneProgress 
} from '@plotops/shared';

// ============================================================================
// SCRIPT PARSING AND BREAKDOWN
// ============================================================================

export interface ScriptParseResult {
  scenes: ParsedScene[];
  characters: ParsedCharacter[];
  locations: ParsedLocation[];
  props: ParsedProp[];
  metadata: ScriptMetadata;
  warnings: string[];
}

export interface ParsedScene {
  sceneNumber: string;
  intExt: 'INT' | 'EXT';
  dayNight: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  locationName: string;
  description: string;
  pageCount: number;
  estimatedDuration: number;
  charactersPresent: string[];
  propsNeeded: string[];
  scriptPageStart: number;
  scriptPageEnd: number;
  complexityRating: 1 | 2 | 3 | 4 | 5;
}

export interface ParsedCharacter {
  name: string;
  characterType: CharacterType;
  speakingLinesCount: number;
  firstAppearancePage: number;
  lastAppearancePage: number;
  scenesPresent: string[];
  description?: string;
}

export interface ParsedLocation {
  name: string;
  locationType: LocationType;
  scenes: string[];
  estimatedSetupTime: number;
  description?: string;
}

export interface ParsedProp {
  name: string;
  description?: string;
  scenes: string[];
  importance: 'background' | 'featured' | 'hero';
  estimatedCost: number;
}

export interface ScriptMetadata {
  totalPages: number;
  estimatedRuntime: number;
  sceneCount: number;
  characterCount: number;
  locationCount: number;
  parserVersion: string;
  parsedAt: string;
}

export const parseScript = (scriptContent: string, format: 'fdx' | 'fountain' | 'pdf' | 'txt' = 'txt'): ScriptParseResult => {
  const warnings: string[] = [];
  const scenes: ParsedScene[] = [];
  const characters: ParsedCharacter[] = [];
  const locations: ParsedLocation[] = [];
  const props: ParsedProp[] = [];

  try {
    // Basic text parsing implementation
    if (format === 'txt') {
      const lines = scriptContent.split('\n');
      let currentScene: Partial<ParsedScene> | null = null;
      let lineNumber = 0;

      for (const line of lines) {
        lineNumber++;
        const trimmedLine = line.trim();

        // Scene header detection (basic pattern)
        const sceneHeaderMatch = trimmedLine.match(/^(INT|EXT)\.?\s+(.+?)\s*-\s*(DAY|NIGHT|DAWN|DUSK)/i);
        if (sceneHeaderMatch) {
          // Save previous scene
          if (currentScene && currentScene.sceneNumber) {
            scenes.push(currentScene as ParsedScene);
          }

          // Start new scene
          const sceneNumber = `${scenes.length + 1}`;
          currentScene = {
            sceneNumber,
            intExt: sceneHeaderMatch[1].toUpperCase() as 'INT' | 'EXT',
            locationName: sceneHeaderMatch[2].trim(),
            dayNight: sceneHeaderMatch[3].toUpperCase() as 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK',
            description: '',
            pageCount: 1,
            estimatedDuration: 2, // Default 2 minutes per page
            charactersPresent: [],
            propsNeeded: [],
            scriptPageStart: Math.floor(lineNumber / 55) + 1, // Approximate page calculation
            scriptPageEnd: Math.floor(lineNumber / 55) + 1,
            complexityRating: 3 as const,
          };
        }

        // Character detection (uppercase names)
        const characterMatch = trimmedLine.match(/^([A-Z][A-Z\s]+)$/);
        if (characterMatch && currentScene) {
          const characterName = characterMatch[1].trim();
          if (!currentScene.charactersPresent?.includes(characterName)) {
            currentScene.charactersPresent?.push(characterName);
          }
        }

        // Action lines and description
        if (currentScene && trimmedLine && !sceneHeaderMatch && !characterMatch) {
          currentScene.description += trimmedLine + ' ';
        }
      }

      // Save last scene
      if (currentScene && currentScene.sceneNumber) {
        scenes.push(currentScene as ParsedScene);
      }

      // Extract unique characters
      const characterNames = new Set<string>();
      scenes.forEach(scene => {
        scene.charactersPresent.forEach(char => characterNames.add(char));
      });

      characterNames.forEach(name => {
        const scenesWithCharacter = scenes.filter(s => s.charactersPresent.includes(name));
        characters.push({
          name,
          characterType: 'featured' as CharacterType,
          speakingLinesCount: 10, // Estimated
          firstAppearancePage: scenesWithCharacter[0]?.scriptPageStart || 1,
          lastAppearancePage: scenesWithCharacter[scenesWithCharacter.length - 1]?.scriptPageEnd || 1,
          scenesPresent: scenesWithCharacter.map(s => s.sceneNumber),
        });
      });

      // Extract unique locations
      const locationNames = new Set<string>();
      scenes.forEach(scene => locationNames.add(scene.locationName));

      locationNames.forEach(name => {
        const scenesAtLocation = scenes.filter(s => s.locationName === name);
        const isInterior = scenesAtLocation.some(s => s.intExt === 'INT');
        
        locations.push({
          name,
          locationType: isInterior ? 'interior' as LocationType : 'exterior' as LocationType,
          scenes: scenesAtLocation.map(s => s.sceneNumber),
          estimatedSetupTime: scenesAtLocation.length * 30, // 30 minutes per scene
        });
      });

      const pageCount = Math.max(1, Math.ceil(lines.length / 55));
      
      const metadata: ScriptMetadata = {
        totalPages: pageCount,
        estimatedRuntime: scenes.reduce((total, scene) => total + scene.estimatedDuration, 0),
        sceneCount: scenes.length,
        characterCount: characters.length,
        locationCount: locations.length,
        parserVersion: '1.0.0',
        parsedAt: new Date().toISOString(),
      };

      return {
        scenes,
        characters,
        locations,
        props,
        metadata,
        warnings,
      };
    } else {
      warnings.push(`${format} format parsing not fully implemented. Using basic text parsing.`);
      return parseScript(scriptContent, 'txt');
    }

    // This code is unreachable but kept for structure
    const metadata: ScriptMetadata = {
      totalPages: 0,
      estimatedRuntime: scenes.reduce((total, scene) => total + scene.estimatedDuration, 0),
      sceneCount: scenes.length,
      characterCount: characters.length,
      locationCount: locations.length,
      parserVersion: '1.0.0',
      parsedAt: new Date().toISOString(),
    };

    return {
      scenes,
      characters,
      locations,
      props,
      metadata,
      warnings,
    };
  } catch (error) {
    throw new Error(`Script parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// ============================================================================
// SCENE CLUSTERING AND OPTIMIZATION
// ============================================================================

export interface ClusteringOptions {
  prioritizeLocation: boolean;
  prioritizeActors: boolean;
  prioritizeWeather: boolean;
  maxScenesPerDay: number;
  preferredShootOrder: 'script_order' | 'location_grouped' | 'actor_grouped';
}

export interface SceneCluster {
  id: string;
  scenes: Scene[];
  location: string;
  estimatedDuration: number;
  requiredActors: string[];
  complexity: number;
  weatherDependency: boolean;
}

export const clusterScenes = (scenes: Scene[], options: ClusteringOptions): SceneCluster[] => {
  const clusters: SceneCluster[] = [];

  if (options.preferredShootOrder === 'location_grouped') {
    // Group by location first
    const locationGroups = groupBy(scenes, 'location_name');
    
    Object.entries(locationGroups).forEach(([location, locationScenes]) => {
      // Further group by day/night within location
      const dayNightGroups = groupBy(locationScenes, 'day_night');
      
      Object.entries(dayNightGroups).forEach(([dayNight, dayNightScenes]) => {
        // Split into manageable chunks
        const chunks = chunkScenesByDuration(dayNightScenes, options.maxScenesPerDay);
        
        chunks.forEach((chunk, index) => {
          clusters.push({
            id: `${location}_${dayNight}_${index + 1}`,
            scenes: chunk,
            location,
            estimatedDuration: chunk.reduce((total, scene) => total + scene.estimated_duration, 0),
            requiredActors: getUniqueActors(chunk),
            complexity: getAverageComplexity(chunk),
            weatherDependency: chunk.some(scene => scene.int_ext === 'EXT'),
          });
        });
      });
    });
  } else if (options.preferredShootOrder === 'actor_grouped') {
    // Group by primary actors
    const actorGroups = groupScenesByActors(scenes);
    
    Object.entries(actorGroups).forEach(([actorGroup, actorScenes]) => {
      const chunks = chunkScenesByDuration(actorScenes, options.maxScenesPerDay);
      
      chunks.forEach((chunk, index) => {
        clusters.push({
          id: `actors_${actorGroup}_${index + 1}`,
          scenes: chunk,
          location: getMostCommonLocation(chunk),
          estimatedDuration: chunk.reduce((total, scene) => total + scene.estimated_duration, 0),
          requiredActors: getUniqueActors(chunk),
          complexity: getAverageComplexity(chunk),
          weatherDependency: chunk.some(scene => scene.int_ext === 'EXT'),
        });
      });
    });
  } else {
    // Script order - maintain original sequence but group efficiently
    const chunks = chunkScenesByDuration(scenes, options.maxScenesPerDay);
    
    chunks.forEach((chunk, index) => {
      clusters.push({
        id: `script_order_${index + 1}`,
        scenes: chunk,
        location: getMostCommonLocation(chunk),
        estimatedDuration: chunk.reduce((total, scene) => total + scene.estimated_duration, 0),
        requiredActors: getUniqueActors(chunk),
        complexity: getAverageComplexity(chunk),
        weatherDependency: chunk.some(scene => scene.int_ext === 'EXT'),
      });
    });
  }

  return clusters;
};

// Helper functions for scene clustering
const chunkScenesByDuration = (scenes: Scene[], maxScenesPerDay: number): Scene[][] => {
  const chunks: Scene[][] = [];
  let currentChunk: Scene[] = [];
  let currentDuration = 0;
  const maxDurationPerDay = 8 * 60; // 8 hours in minutes

  for (const scene of scenes) {
    if (currentChunk.length >= maxScenesPerDay || 
        currentDuration + scene.estimated_duration > maxDurationPerDay) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentDuration = 0;
      }
    }
    
    currentChunk.push(scene);
    currentDuration += scene.estimated_duration;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const getUniqueActors = (scenes: Scene[]): string[] => {
  const actors = new Set<string>();
  // This would be populated from character assignments
  // For now, return empty array
  return Array.from(actors);
};

const getAverageComplexity = (scenes: Scene[]): number => {
  const total = scenes.reduce((sum, scene) => sum + scene.complexity_rating, 0);
  return Math.round(total / scenes.length);
};

const getMostCommonLocation = (scenes: Scene[]): string => {
  const locationCounts = scenes.reduce((counts, scene) => {
    counts[scene.location_name] = (counts[scene.location_name] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
};

const groupScenesByActors = (scenes: Scene[]): Record<string, Scene[]> => {
  // This would group scenes by their required actors
  // For now, return scenes grouped by location as a placeholder
  return groupBy(scenes, 'location_name');
};

// ============================================================================
// SCHEDULE OPTIMIZATION
// ============================================================================

export interface ScheduleConstraints {
  actorAvailability: { actorId: string; availableDates: string[] }[];
  locationAvailability: { locationId: string; availableDates: string[] }[];
  weatherPreferences: { sceneId: string; preferredWeather: string[] }[];
  priorityScenes: string[];
  budgetConstraints: { maxDailyBudget: number };
  crewAvailability: { crewMember: string; availableDates: string[] }[];
}

export interface OptimizedSchedule {
  scheduleItems: OptimizedScheduleItem[];
  totalDays: number;
  estimatedCost: number;
  conflicts: ScheduleConflict[];
  efficiency: number;
}

export interface OptimizedScheduleItem {
  sceneId: string;
  suggestedDate: string;
  suggestedCallTime: string;
  suggestedWrapTime: string;
  locationId: string;
  requiredActors: string[];
  estimatedCost: number;
  conflictScore: number;
}

export interface ScheduleConflict {
  type: 'actor_conflict' | 'location_conflict' | 'weather_conflict' | 'budget_conflict';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedScenes: string[];
  suggestedResolution: string;
}

export const optimizeSchedule = (
  scenes: Scene[],
  constraints: ScheduleConstraints,
  startDate: string
): OptimizedSchedule => {
  const scheduleItems: OptimizedScheduleItem[] = [];
  const conflicts: ScheduleConflict[] = [];
  let currentDate = new Date(startDate);
  let totalCost = 0;

  // Cluster scenes for efficient shooting
  const clusters = clusterScenes(scenes, {
    prioritizeLocation: true,
    prioritizeActors: true,
    prioritizeWeather: true,
    maxScenesPerDay: 6,
    preferredShootOrder: 'location_grouped',
  });

  // Schedule each cluster
  for (const cluster of clusters) {
    // Skip weekends unless necessary
    while (isWeekend(currentDate)) {
      currentDate = addDays(currentDate, 1);
    }

    const dateStr = currentDate.toISOString().split('T')[0];
    let dailyCost = 0;
    let callTime = '07:00';
    let currentTime = new Date(`${dateStr}T${callTime}:00`);

    for (const scene of cluster.scenes) {
      const estimatedCost = calculateSceneCost(scene);
      dailyCost += estimatedCost;

      // Check budget constraints
      if (dailyCost > constraints.budgetConstraints.maxDailyBudget) {
        conflicts.push({
          type: 'budget_conflict',
          severity: 'high',
          description: `Daily budget exceeded for ${dateStr}`,
          affectedScenes: [scene.id],
          suggestedResolution: 'Move scene to next day or reduce scope',
        });
      }

      const wrapTime = new Date(currentTime.getTime() + scene.estimated_duration * 60000);
      
      scheduleItems.push({
        sceneId: scene.id,
        suggestedDate: dateStr,
        suggestedCallTime: currentTime.toTimeString().substring(0, 5),
        suggestedWrapTime: wrapTime.toTimeString().substring(0, 5),
        locationId: scene.location_id || '',
        requiredActors: [], // Would be populated from character assignments
        estimatedCost,
        conflictScore: 0,
      });

      currentTime = new Date(wrapTime.getTime() + 30 * 60000); // 30-minute buffer
    }

    totalCost += dailyCost;
    currentDate = addDays(currentDate, 1);
  }

  const totalDays = getDaysBetween(startDate, currentDate.toISOString().split('T')[0]);
  const efficiency = scenes.length / totalDays; // Scenes per day

  return {
    scheduleItems,
    totalDays,
    estimatedCost: totalCost,
    conflicts,
    efficiency,
  };
};

// ============================================================================
// BUDGET CALCULATIONS
// ============================================================================

export interface BudgetBreakdown {
  categories: BudgetCategory[];
  totalBudget: number;
  contingency: number;
  finalBudget: number;
}

export interface BudgetCategory {
  name: string;
  items: BudgetItem[];
  subtotal: number;
  percentage: number;
}

export interface BudgetItem {
  name: string;
  quantity: number;
  rate: number;
  total: number;
  notes?: string;
}

export const calculateProjectBudget = (
  project: Project,
  scenes: Scene[],
  cast: Character[],
  locations: Location[],
  assets: Asset[]
): BudgetBreakdown => {
  const categories: BudgetCategory[] = [];

  // Above-the-Line costs
  const aboveTheLine = calculateAboveTheLineCosts(cast);
  categories.push(aboveTheLine);

  // Below-the-Line costs
  const belowTheLine = calculateBelowTheLineCosts(scenes, locations, assets);
  categories.push(belowTheLine);

  // Post-Production costs
  const postProduction = calculatePostProductionCosts(scenes);
  categories.push(postProduction);

  const totalBudget = categories.reduce((sum, cat) => sum + cat.subtotal, 0);
  const contingency = totalBudget * 0.1; // 10% contingency
  const finalBudget = totalBudget + contingency;

  // Calculate percentages
  categories.forEach(category => {
    category.percentage = (category.subtotal / totalBudget) * 100;
  });

  return {
    categories,
    totalBudget,
    contingency,
    finalBudget,
  };
};

const calculateAboveTheLineCosts = (cast: Character[]): BudgetCategory => {
  const items: BudgetItem[] = [];

  // Producer fees
  items.push({
    name: 'Producer',
    quantity: 1,
    rate: 50000,
    total: 50000,
    notes: 'Executive Producer fee',
  });

  // Director fees
  items.push({
    name: 'Director',
    quantity: 1,
    rate: 75000,
    total: 75000,
    notes: 'Director fee',
  });

  // Cast costs (estimated based on character types)
  const leadCount = cast.filter(c => c.character_type === 'lead').length;
  const supportingCount = cast.filter(c => c.character_type === 'supporting').length;
  const featuredCount = cast.filter(c => c.character_type === 'featured').length;

  if (leadCount > 0) {
    items.push({
      name: 'Lead Actors',
      quantity: leadCount,
      rate: 25000,
      total: leadCount * 25000,
    });
  }

  if (supportingCount > 0) {
    items.push({
      name: 'Supporting Actors',
      quantity: supportingCount,
      rate: 10000,
      total: supportingCount * 10000,
    });
  }

  if (featuredCount > 0) {
    items.push({
      name: 'Featured Actors',
      quantity: featuredCount,
      rate: 2000,
      total: featuredCount * 2000,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return {
    name: 'Above-the-Line',
    items,
    subtotal,
    percentage: 0, // Will be calculated later
  };
};

const calculateBelowTheLineCosts = (scenes: Scene[], locations: Location[], assets: Asset[]): BudgetCategory => {
  const items: BudgetItem[] = [];
  const shootDays = Math.ceil(scenes.length / 4); // Estimate 4 scenes per day

  // Crew costs
  items.push({
    name: 'Crew',
    quantity: shootDays,
    rate: 5000,
    total: shootDays * 5000,
    notes: 'Daily crew rate',
  });

  // Equipment rental
  items.push({
    name: 'Equipment',
    quantity: shootDays,
    rate: 2000,
    total: shootDays * 2000,
    notes: 'Camera, lighting, sound equipment',
  });

  // Location costs
  const locationCosts = locations.reduce((sum, location) => {
    return sum + (location.cost_per_day || 1000);
  }, 0);

  items.push({
    name: 'Locations',
    quantity: 1,
    rate: locationCosts,
    total: locationCosts,
    notes: 'Location fees and permits',
  });

  // Props and wardrobe
  const assetCosts = assets.reduce((sum, asset) => {
    return sum + (asset.cost || 500);
  }, 0);

  items.push({
    name: 'Props & Wardrobe',
    quantity: 1,
    rate: assetCosts,
    total: assetCosts,
  });

  // Catering
  items.push({
    name: 'Catering',
    quantity: shootDays,
    rate: 800,
    total: shootDays * 800,
    notes: 'Meals for cast and crew',
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return {
    name: 'Below-the-Line',
    items,
    subtotal,
    percentage: 0,
  };
};

const calculatePostProductionCosts = (scenes: Scene[]): BudgetCategory => {
  const items: BudgetItem[] = [];
  const totalRuntime = scenes.reduce((sum, scene) => sum + scene.estimated_duration, 0);
  const editingWeeks = Math.ceil(totalRuntime / (60 * 10)); // 10 minutes per week

  items.push({
    name: 'Editing',
    quantity: editingWeeks,
    rate: 3000,
    total: editingWeeks * 3000,
    notes: 'Editor weekly rate',
  });

  items.push({
    name: 'Color Correction',
    quantity: 1,
    rate: 5000,
    total: 5000,
  });

  items.push({
    name: 'Sound Design',
    quantity: 1,
    rate: 8000,
    total: 8000,
  });

  items.push({
    name: 'Music',
    quantity: 1,
    rate: 10000,
    total: 10000,
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return {
    name: 'Post-Production',
    items,
    subtotal,
    percentage: 0,
  };
};

const calculateSceneCost = (scene: Scene): number => {
  // Base cost per scene
  let cost = 2000;

  // Complexity multiplier
  cost *= scene.complexity_rating * 0.5;

  // Location type multiplier
  if (scene.int_ext === 'EXT') {
    cost *= 1.3; // Exterior scenes cost more
  }

  // Duration multiplier
  cost *= (scene.estimated_duration / 60) * 0.8;

  return Math.round(cost);
};

// ============================================================================
// PRODUCTION PROGRESS TRACKING
// ============================================================================

export interface ProductionMetrics {
  overallProgress: number;
  scenesProgress: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    percentage: number;
  };
  schedulePerformance: {
    onTime: number;
    delayed: number;
    ahead: number;
    averageDelay: number; // in minutes
  };
  budgetPerformance: {
    allocated: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    projectedOverrun: number;
  };
  efficiency: {
    scenesPerDay: number;
    averageSceneDuration: number;
    crewUtilization: number;
  };
}

export const calculateProductionMetrics = (
  project: Project,
  scenes: Scene[],
  scheduleItems: ScheduleItem[],
  actualCosts: number[]
): ProductionMetrics => {
  const scenesProgress = calculateSceneProgress(scenes);
  
  // Schedule performance
  const completedScheduleItems = scheduleItems.filter(item => 
    scenes.find(s => s.id === item.scene_id)?.status === 'completed'
  );
  
  let totalDelay = 0;
  let onTime = 0;
  let delayed = 0;
  let ahead = 0;

  completedScheduleItems.forEach(item => {
    const scene = scenes.find(s => s.id === item.scene_id);
    if (scene?.actual_end_time && scene?.scheduled_date) {
      const scheduledEnd = new Date(`${scene.scheduled_date}T${item.estimated_wrap_time}`);
      const actualEnd = new Date(scene.actual_end_time);
      const delayMinutes = (actualEnd.getTime() - scheduledEnd.getTime()) / (1000 * 60);
      
      totalDelay += delayMinutes;
      
      if (delayMinutes > 30) delayed++;
      else if (delayMinutes < -30) ahead++;
      else onTime++;
    }
  });

  const averageDelay = completedScheduleItems.length > 0 ? totalDelay / completedScheduleItems.length : 0;

  // Budget performance
  const totalActualCosts = actualCosts.reduce((sum, cost) => sum + cost, 0);
  const budgetAllocated = project.budget || 0;
  const budgetRemaining = budgetAllocated - totalActualCosts;
  const percentageUsed = budgetAllocated > 0 ? (totalActualCosts / budgetAllocated) * 100 : 0;
  
  // Project overrun based on current burn rate
  const completionPercentage = scenesProgress.percentage / 100;
  const projectedTotalCost = completionPercentage > 0 ? totalActualCosts / completionPercentage : totalActualCosts;
  const projectedOverrun = Math.max(0, projectedTotalCost - budgetAllocated);

  // Efficiency metrics
  const shootDays = new Set(completedScheduleItems.map(item => item.shoot_date)).size;
  const scenesPerDay = shootDays > 0 ? scenesProgress.completed / shootDays : 0;
  const totalDuration = scenes
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.estimated_duration, 0);
  const averageSceneDuration = scenesProgress.completed > 0 ? totalDuration / scenesProgress.completed : 0;

  return {
    overallProgress: scenesProgress.percentage,
    scenesProgress,
    schedulePerformance: {
      onTime,
      delayed,
      ahead,
      averageDelay,
    },
    budgetPerformance: {
      allocated: budgetAllocated,
      spent: totalActualCosts,
      remaining: budgetRemaining,
      percentageUsed,
      projectedOverrun,
    },
    efficiency: {
      scenesPerDay,
      averageSceneDuration,
      crewUtilization: 85, // This would be calculated from crew time tracking
    },
  };
};

// ============================================================================
// VALIDATION SCHEMAS AND BUSINESS RULES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export const validateProject = (project: Partial<Project>): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!project.title?.trim()) {
    errors.push({
      field: 'title',
      message: 'Project title is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!project.tenant_id) {
    errors.push({
      field: 'tenant_id',
      message: 'Tenant ID is required',
      code: 'REQUIRED_FIELD',
    });
  }

  // Business rules
  if (project.budget && project.budget < 10000) {
    warnings.push({
      field: 'budget',
      message: 'Budget seems low for a film production',
      suggestion: 'Consider reviewing budget allocation',
    });
  }

  if (project.start_date && project.end_date) {
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    
    if (end <= start) {
      errors.push({
        field: 'end_date',
        message: 'End date must be after start date',
        code: 'INVALID_DATE_RANGE',
      });
    }

    const duration = getDaysBetween(start, end);
    if (duration > 365) {
      warnings.push({
        field: 'end_date',
        message: 'Project duration exceeds one year',
        suggestion: 'Consider breaking into phases',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
