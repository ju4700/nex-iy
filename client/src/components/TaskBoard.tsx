import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import axios from 'axios';
import { useUserStore } from '../store/user';
import '../styles/tasks.css';

type Task = { _id: string; title: string; status: string; priority: string; description?: string };

const TaskCard = ({ task }: { task: Task }) => {
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
  const user = useUserStore((state) => state.user);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => setTasks(res.data));
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(task => task._id === active.id);
    if (!activeTask) return;

    const overContainer = over.data?.current?.sortable?.containerId || over.id;
    
    const updatedTasks = tasks.map(task => 
      task._id === activeTask._id 
        ? { ...task, status: overContainer }
        : task
    );

    setTasks(updatedTasks);
    
    axios.put(`http://localhost:5000/api/tasks/${activeTask._id}`, 
      { status: overContainer },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
  };

  const columns = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

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
                {columnTasks.map((task: Task) => (
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