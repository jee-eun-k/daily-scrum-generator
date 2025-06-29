import { GripVertical, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Extended task type with auto-inserted flag
interface ExtendedTask {
  id: string;
  text: string;
  workItemId?: string;
  isAutoInserted?: boolean;
}

interface TaskItemProps {
  task: ExtendedTask
  section: string
  onUpdateText: (section: string, id: string, newText: string) => void
  onUpdateWorkItemId: (section: string, id: string, workItemId: string) => void
  onRemove: (section: string, id: string) => void
  onDragStart: (e: React.DragEvent, section: string, id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, section: string, id?: string) => void
}

export const TaskItem = ({ 
  task, 
  section, 
  onUpdateText, 
  onUpdateWorkItemId,
  onRemove, 
  onDragStart, 
  onDragOver, 
  onDrop 
}: TaskItemProps) => {
  const isAutoInserted = task.isAutoInserted || false;
  
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-md border shadow-sm mb-2 ${
        isAutoInserted 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-white border-input'
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, section, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, section, task.id)}
      data-task-id={task.id}
      data-section={section}
    >
      {/* Remove button with X icon */}
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
        onClick={() => onRemove(section, task.id)}
        title={isAutoInserted ? "자동 추가된 태스크 삭제" : "태스크 삭제"}
      >
        <X className="h-3 w-3" />
      </Button>
      
      <GripVertical className="text-gray-400 cursor-grab w-5 h-5" />
      {isAutoInserted && (
        <Calendar className="text-blue-500 w-4 h-4" title="자동 추가된 주간 업무" />
      )}
      
      {/* Work Item ID input */}
      <Input
        type="number"
        value={task.workItemId || ''}
        onChange={(e) => onUpdateWorkItemId(section, task.id, e.target.value)}
        placeholder="WI#"
        className="w-16 h-8 text-xs text-center"
        title="Work Item ID"
        readOnly={isAutoInserted}
      />
      
      <Textarea
        value={task.text}
        onChange={(e) => onUpdateText(section, task.id, e.target.value)}
        placeholder="새 태스크 입력"
        rows={1}
        className={`flex-grow min-h-[40px] resize-none ${
          isAutoInserted ? 'bg-blue-50' : ''
        }`}
        readOnly={isAutoInserted}
      />
    </div>
  )
}