import { FC, useState, useEffect } from 'react';
import { styled } from '@emotion/styled';
import axios from 'axios';
import { useAuth } from '@utils/auth';

const TasksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TaskList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: white;
`;

const TaskItem = styled.div`
  padding: 5px;
  border-bottom: 1px solid #eee;
`;

const Filters = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const Input = styled.input`
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

const Tasks: FC = () => {
  const { user, token, selectedTeam } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('asc');

  useEffect(() => {
    if (selectedTeam) {
      fetchTasks();
    }
  }, [selectedTeam, page, limit, filter, sort]);

  const fetchTasks = () => {
    axios.get(`http://localhost:5000/api/tasks/${selectedTeam}`, {
      params: { page, limit, filter, sort },
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      setTasks(response.data.data.data || []);
    });
  };

  if (!selectedTeam) return <div>Select a team to view tasks</div>;

  return (
    <TasksContainer>
      <Filters>
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter tasks..."
        />
        <Button onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}>
          Sort {sort === 'asc' ? '↓' : '↑'}
        </Button>
      </Filters>
      <TaskList>
        {tasks.map((task) => (
          <TaskItem key={task._id}>{task.title} - {task.status}</TaskItem>
        ))}
      </TaskList>
    </TasksContainer>
  );
};

export default Tasks;