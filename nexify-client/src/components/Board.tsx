import { FC, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { styled } from '@emotion/styled';
import { useAuth } from '@utils/auth';
import axios from 'axios';

const BoardContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const Column = styled.div`
  flex: 1;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
`;

const Task = styled.div<{ isDragging: boolean }>`
  padding: 10px;
  margin: 5px 0;
  background: ${props => (props.isDragging ? '#e0f7fa' : 'white')};
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: move;
`;

const InputArea = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const Board: FC = () => {
  const { user, token, selectedTeam } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (selectedTeam) {
      fetchTasks();
    }
  }, [selectedTeam]);

  const fetchTasks = () => {
    axios.get(`http://localhost:5000/api/tasks/${selectedTeam}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      setTasks(response.data.data.data || []);
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const updatedTasks = Array.from(tasks);
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    movedTask.status = result.destination.droppableId;
    updatedTasks.splice(result.destination.index, 0, movedTask);

    setTasks(updatedTasks);
    axios.put(`http://localhost:5000/api/tasks/${movedTask._id}`, { status: movedTask.status }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchTasks());
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask && selectedTeam) {
      axios.post(`http://localhost:5000/api/tasks/${selectedTeam}`, { title: newTask }, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => {
        setNewTask('');
        fetchTasks();
      });
    }
  };

  if (!selectedTeam) return <div>Select a team to use the board</div>;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <BoardContainer>
        {['todo', 'in-progress', 'done'].map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <Column ref={provided.innerRef} {...provided.droppableProps}>
                <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                {tasks.filter((task) => task.status === status).map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided, snapshot) => (
                      <Task
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                      >
                        {task.title}
                      </Task>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Column>
            )}
          </Droppable>
        ))}
      </BoardContainer>
      <InputArea onSubmit={handleAddTask}>
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Task"
        />
        <Button type="submit">Add</Button>
      </InputArea>
    </DragDropContext>
  );
};

export default Board;