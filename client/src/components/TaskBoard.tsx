import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  useSortable 
} from '@dnd-kit/sortable';
import axios from 'axios';
import { useUserStore } from '../store/user';
import '../styles/tasks.css';

type Task = {
  _id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: string;
  description?: string;
};

type Columns = {
  [K in Task['status']]: Task[];
};

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
      {...attributes}
      {...listeners}
    >
      <h4>{task.title}</h4>
      <p>{task.description || 'No description'}</p>
      <span className={`priority-${task.priority}`}>
        Priority: {task.priority}
      </span>
    </div>
  );
};

const TaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.get<Task[]>('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setTasks(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(task => task._id === active.id);
    if (!activeTask) return;

    const overContainer = over.data?.current?.sortable?.containerId || over.id;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const updatedTasks = tasks.map(task => 
        task._id === activeTask._id 
          ? { ...task, status: overContainer as Task['status'] }
          : task
      );

      setTasks(updatedTasks);
      
      await axios.put(
        `http://localhost:5000/api/tasks/${activeTask._id}`, 
        { status: overContainer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      // Revert the state if the API call fails
      setTasks([...tasks]);
    }
  };

  const columns: Columns = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="task-board-container">
      <h2>Task Management</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="task-board">
          {Object.entries(columns).map(([status, columnTasks]) => (
            <div key={status} className="task-column">
              <h3>{status.replace('_', ' ').toUpperCase()} ({columnTasks.length})</h3>
              <SortableContext items={columnTasks.map(task => task._id)}>
                {columnTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default TaskBoard;