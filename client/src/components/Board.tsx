import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { io, Socket } from 'socket.io-client';
import { Task } from '../types';

const socket: Socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`, {
  reconnection: true,
  reconnectionDelay: 1000,
  autoConnect: true
});

const Board = (): JSX.Element => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');

  const fetchTasks = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const addTask = async (): Promise<void> => {
    if (newTask.trim()) {
      try {
        const response = await fetch('http://localhost:5000/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTask, status: 'todo' }),
        });
        const data = await response.json();
        setTasks([...tasks, data.data]);
        setNewTask('');
        socket.emit('task-update', data.data);
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    }
  };

  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    
    const updatedTasks = [...tasks];
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const [movedTask] = updatedTasks.splice(sourceIndex, 1);
    
    // Update the task status
    const newStatus = result.destination.droppableId;
    if (newStatus === 'todo' || newStatus === 'in-progress' || newStatus === 'done') {
      movedTask.status = newStatus;
    }
    
    // Insert at new position
    updatedTasks.splice(destinationIndex, 0, movedTask);
    
    setTasks(updatedTasks);
    
    // Notify other clients about the update
    socket.emit('task-update', movedTask);
  };

  useEffect(() => {
    // Fetch initial tasks
    fetchTasks();
    
    // Listen for task updates from other clients
    socket.on('task-update', (task: Task) => {
      setTasks((prev) => {
        const index = prev.findIndex((t) => t._id === task._id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = task;
          return updated;
        }
        return [...prev, task];
      });
    });
    
    // Cleanup on component unmount
    return () => {
      socket.off('task-update');
    };
  }, []);

  const styles = {
    container: { margin: '20px' },
    header: { color: '#333', marginBottom: '10px' },
    inputContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
    input: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1em' },
    button: {
      padding: '8px 16px',
      background: '#28a745',
      color: '#fff',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1em',
    },
    board: { display: 'flex', gap: '20px' },
    column: { flex: 1, background: '#f0f0f0', padding: '10px', borderRadius: '4px' },
    task: { background: '#fff', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px' },
  } as const;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Planning Board</h2>
      <div style={styles.inputContainer}>
        <label htmlFor="task-input" style={{ display: 'none' }}>
          Add a new task
        </label>
        <input
          id="task-input"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          style={styles.input}
        />
        <button onClick={addTask} style={styles.button}>
          Add
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.board}>
          {['todo', 'in-progress', 'done'].map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef as React.RefObject<HTMLDivElement>} style={styles.column}>
                  <h3>{status.replace('-', ' ').toUpperCase()}</h3>
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef as React.RefObject<HTMLDivElement>}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...styles.task, ...provided.draggableProps.style }}
                          >
                            {task.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;