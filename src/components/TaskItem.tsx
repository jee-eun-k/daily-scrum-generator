import { GripVertical, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md ${
        isAutoInserted 
          ? 'border-blue-200 bg-blue-50/50' 
          : 'border-border hover:border-border/80'
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, section, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, section, task.id)}
      data-task-id={task.id}
      data-section={section}
    >
      {/* Remove button with X icon */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(section, task.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isAutoInserted ? "자동 추가된 태스크 삭제" : "태스크 삭제"}</p>
        </TooltipContent>
      </Tooltip>
      
      <GripVertical className="text-muted-foreground cursor-grab w-5 h-5" />
      {isAutoInserted && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 bg-blue-50">
              <Calendar className="w-3 h-3" />
              자동
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>자동 추가된 주간 업무</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* Work Item ID input */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Input
            type="text"
            value={task.workItemId || ''}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow digits
              if (/^\d*$/.test(value)) {
                onUpdateWorkItemId(section, task.id, value);
              }
            }}
            placeholder="ID"
            className="w-20 h-8 text-xs text-center"
            readOnly={isAutoInserted}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Work Item ID</p>
        </TooltipContent>
      </Tooltip>
      
      <Textarea
        value={task.text}
        onChange={(e) => onUpdateText(section, task.id, e.target.value)}
        placeholder="새 태스크 입력"
        rows={1}
        className={`flex-grow min-h-[32px] resize-none text-sm ${
          isAutoInserted ? 'bg-blue-50/30' : ''
        }`}
        readOnly={isAutoInserted}
      />
    </div>
  )
}