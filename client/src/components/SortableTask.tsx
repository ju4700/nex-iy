import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

type Task = { _id: string; title: string; status: string; priority: string; description?: string };

interface SortableTaskProps {
  task: Task;
  index: number;
}

export const SortableTask = ({ task, index }: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="task-card card"
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <h4>{task.title}</h4>
      <p>{task.description || 'No description'}</p>
      <span className={`priority-${task.priority}`}>Priority: {task.priority}</span>
    </motion.div>
  );
};