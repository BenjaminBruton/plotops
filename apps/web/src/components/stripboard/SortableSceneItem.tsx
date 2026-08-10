import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableSceneItemProps {
  scene: any
  isSelected: boolean
  onSelect: () => void
  onEdit: (e: React.MouseEvent) => void
  onSchedule: (e: React.MouseEvent) => void
  getSceneTypeColor: (type: string) => string
  getTimeOfDayColor: (timeOfDay: string) => string
  getStatusColor: (status: string) => string
}

export function SortableSceneItem({
  scene,
  isSelected,
  onSelect,
  onEdit,
  onSchedule,
  getSceneTypeColor,
  getTimeOfDayColor,
  getStatusColor,
}: SortableSceneItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-gradient-to-r ${getSceneTypeColor(scene.scene_type)} rounded-lg p-4 shadow-soft hover:shadow-medium transition-all duration-200 border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1" onClick={onSelect}>
          {/* Drag Handle */}
          <div 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/20 rounded transition-colors"
            title="Drag to reorder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          
          {/* Scene Number */}
          <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center font-bold text-lg">
            {scene.scene_number}
          </div>
          
          {/* Scene Info */}
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{scene.scene_name || `Scene ${scene.scene_number}`}</h4>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {scene.location_name || 'No location'}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r ${getTimeOfDayColor(scene.time_of_day)}`}>
                {scene.time_of_day?.toUpperCase()}
              </span>
              <span className="text-sm">{scene.page_count || 0} pages</span>
              <span className="text-sm">{scene.estimated_duration || 0} min</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(scene.status || 'not_scheduled')}`}>
              {(scene.status || 'NOT SCHEDULED').replace('_', ' ').toUpperCase()}
            </span>
            {scene.shoot_date && (
              <span className="text-xs text-foreground/70">
                {new Date(scene.shoot_date + 'T00:00:00').toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Cast</h5>
              <div className="flex flex-wrap gap-1">
                {scene.scene_characters && scene.scene_characters.length > 0 ? (
                  scene.scene_characters.map((sc: any, index: number) => (
                    <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-white/80 text-foreground">
                      {sc.character?.name || 'Unknown'}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-foreground/60">No cast assigned</span>
                )}
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-2">Props & Equipment</h5>
              <div className="flex flex-wrap gap-1">
                {scene.scene_props && scene.scene_props.length > 0 ? (
                  scene.scene_props.map((sp: any, index: number) => (
                    <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-white/80 text-foreground">
                      {sp.prop?.name || 'Unknown'} {sp.quantity > 1 ? `(${sp.quantity})` : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-foreground/60">No props assigned</span>
                )}
              </div>
            </div>
          </div>
          {scene.description && (
            <div className="mt-4">
              <h5 className="font-medium mb-1">Description</h5>
              <p className="text-sm text-foreground/80">{scene.description}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-4">
            <button 
              onClick={onEdit}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium h-8 px-3"
            >
              Edit Scene
            </button>
            <button 
              onClick={onSchedule}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
            >
              Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
