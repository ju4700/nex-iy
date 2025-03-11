import { useState, useEffect } from 'react';
import { Task } from '../types';

interface TasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

const Tasks = (): JSX.Element => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);
  const [total, setTotal] = useState<number>(0);
  const [filter, setFilter] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const sortDirection = sortAsc ? 'asc' : 'desc';
      const response = await fetch(
        `http://localhost:5000/api/tasks?page=${page}&limit=${limit}&filter=${filter}&sort=${sortDirection}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const result = await response.json();
      const taskData: TasksResponse = result.data;
      
      setTasks(taskData.data);
      setTotal(taskData.total);
      setPage(taskData.page);
      setLoading(false);
    } catch (err) {
      setError('Error fetching tasks');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, filter, sortAsc]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const toggleSortOrder = () => {
    setSortAsc(!sortAsc);
  };

  const goToPage = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  const styles = {
    container: { margin: '20px', maxWidth: '800px' },
    header: { color: '#333', marginBottom: '10px' },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
    },
    input: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      width: '200px',
    },
    sortButton: {
      padding: '8px 16px',
      background: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    taskList: {
      border: '1px solid #ddd',
      borderRadius: '4px',
    },
    task: {
      padding: '10px 15px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
    },
    pagination: {
      marginTop: '15px',
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
    },
    pageButton: {
      padding: '5px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      background: '#f9f9f9',
      cursor: 'pointer',
    },
    activePageButton: {
      background: '#007bff',
      color: '#fff',
    },
    loading: { color: '#666', textAlign: 'center', padding: '20px' },
    error: { color: '#d9534f', padding: '10px' },
  } as const;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Task List</h2>
      
      <div style={styles.controls}>
        <div>
          <label htmlFor="task-filter" style={{ display: 'none' }}>Filter tasks</label>
          <input
            id="task-filter"
            type="text"
            placeholder="Filter tasks..."
            value={filter}
            onChange={handleFilterChange}
            style={styles.input}
          />
        </div>
        <button
          onClick={toggleSortOrder}
          style={styles.sortButton}
          aria-label="Sort by date"
        >
          Sort {sortAsc ? '↑' : '↓'}
        </button>
      </div>
      
      {loading ? (
        <div style={styles.loading}>Loading tasks...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : (
        <>
          <div style={styles.taskList}>
            {tasks.length === 0 ? (
              <div style={styles.task}>No tasks found</div>
            ) : (
              tasks.map((task) => (
                <div key={task._id} style={styles.task}>
                  <div>{task.title}</div>
                  <div>{task.status}</div>
                </div>
              ))
            )}
          </div>
          
          <div style={styles.pagination}>
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              style={{
                ...styles.pageButton,
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                style={{
                  ...styles.pageButton,
                  ...(pageNum === page ? styles.activePageButton : {}),
                }}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              style={{
                ...styles.pageButton,
                opacity: page >= Math.ceil(total / limit) ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Tasks;