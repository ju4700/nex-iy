import { useState, useEffect, useCallback } from 'react';
import { debounce } from '../utils/debounce';

interface Task {
  _id: string;
  title: string;
  status: 'open' | 'in-progress' | 'done';
  createdAt: string;
}

interface TasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

const Tasks = (): JSX.Element => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const ITEMS_PER_PAGE = 5;

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks?page=${currentPage}&limit=${ITEMS_PER_PAGE}&filter=${filter}&sort=${sortOrder}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      
      const result = await response.json();
      setTasks(result.data.data || []);
      setTotal(result.data.total);
      setTotalPages(Math.ceil(result.data.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filter, sortOrder]);

  // Debounced version of fetchTasks for filtering
  const debouncedFetchTasks = useCallback(
    debounce(() => {
      fetchTasks();
    }, 300),
    [fetchTasks]
  );

  // Handle filter change with debounce
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page on filter change
    debouncedFetchTasks();
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, sortOrder, currentPage]);

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
          Sort {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
      
      {isLoading ? (
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
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.pageButton,
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            
            {totalPages > 0 && (
              <>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show pages around current page if there are many pages
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (pageNum > totalPages - 4) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      style={{
                        ...styles.pageButton,
                        ...(pageNum === currentPage ? styles.activePageButton : {}),
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </>
            )}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={{
                ...styles.pageButton,
                opacity: currentPage >= totalPages ? 0.5 : 1,
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