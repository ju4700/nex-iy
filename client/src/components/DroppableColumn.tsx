import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
  id: string;
  title: string;
  tasks: any[];
  children: React.ReactNode;
}

export const DroppableColumn = ({ id, title, tasks, children }: DroppableColumnProps) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="task-column card" ref={setNodeRef}>
      <h3>{title} ({tasks.length})</h3>
      {children}
    </div>
  );
};