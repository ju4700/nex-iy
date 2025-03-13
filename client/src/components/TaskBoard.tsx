import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import axios from 'axios';
import { useUserStore } from '../store/user';
import { SortableTask } from './SortableTask';
import { DroppableColumn } from './DroppableColumn';
import '../styles/tasks.css';

type Task = { _id: string; title: string; status: string; priority: string; description?: string };

const TaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('all');
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(task => task._id === active.id);
    if (!activeTask) return;

    const updatedTasks = tasks.map(task => {
      if (task._id === active.id) {
        return { ...task, status: over.id as string };
      }
      return task;
    });

    setTasks(updatedTasks);
    axios.put(`http://localhost:5000/api/tasks/${activeTask._id}`, 
      { status: over.id }, 
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.priority === filter);
  const columns = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="task-container">
      <motion.div
        className="task-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Task Board</h2>
        <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </motion.div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          className="task-board"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {Object.entries(columns).map(([status, columnTasks]) => (
            <DroppableColumn
              key={status}
              id={status}
              title={status.replace('_', ' ').toUpperCase()}
              tasks={columnTasks}
            >
              <SortableContext items={columnTasks.map(task => task._id)}>
                {columnTasks.map((task: Task, index: number) => (
                  <SortableTask
                    key={task._id}
                    task={task}
                    index={index}
                  />
                ))}
              </SortableContext>
            </DroppableColumn>
          ))}
        </motion.div>
      </DndContext>
    </div>
  );
};

export default TaskBoard;