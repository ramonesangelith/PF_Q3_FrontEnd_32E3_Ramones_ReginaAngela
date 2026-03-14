import { useState } from 'react';
import './index.css';

// Check your .NET console to confirm the port (usually 5031-5200 for newer versions)
const API_BASE_URL = 'http://localhost:5031/api/todo';

function App() {
    // ADVANCED USE-CASE: A single, comprehensive state object
    const [state, setState] = useState({
        todos: [],
        isLoading: false,
        error: null,
        newTaskInput: ''
    });

    // Helper to partially update state
    const updateState = (updates) => {
        setState((prevState) => ({ ...prevState, ...updates }));
    };

    // 1. READ: Manual Fetch (No useEffect allowed!)
    const loadTodos = async () => {
        updateState({ isLoading: true, error: null });
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch todos.');
            const data = await response.json();
            updateState({ todos: data, isLoading: false });
        } catch (err) {
            updateState({ error: err.message, isLoading: false });
        }
    };

    // 2. CREATE
    const addTodo = async (e) => {
        e.preventDefault();
        if (!state.newTaskInput.trim()) return;

        updateState({ isLoading: true, error: null });
        try {
            const newTodo = { task: state.newTaskInput, isCompleted: false };
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTodo)
            });

            if (!response.ok) throw new Error('Failed to create todo.');
            
            const createdTodo = await response.json();

            // Update local state without re-fetching everything
            updateState({
                todos: [...state.todos, createdTodo],
                newTaskInput: '',
                isLoading: false
            });
        } catch (err) {
            updateState({ error: err.message, isLoading: false });
        }
    };

    // 3. UPDATE
    const toggleCompletion = async (todo) => {
        updateState({ isLoading: true, error: null });
        try {
            const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
            const response = await fetch(`${API_BASE_URL}/${todo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTodo)
            });

            if (!response.ok) throw new Error('Failed to update todo.');

            // Map the local state to show the change immediately
            const updatedTodos = state.todos.map(t => t.id === todo.id ? updatedTodo : t);
            updateState({ todos: updatedTodos, isLoading: false });
        } catch (err) {
            updateState({ error: err.message, isLoading: false });
        }
    };

    const deleteTodo = async (id) => {
      try {
        const response = await fetch(`/api/todo/${id}`, {
          method: 'DELETE',
        });

      if (response.ok) {
      // updateState helper filters out the deleted item
        updateState((prevState) => prevState.filter(todo => todo.id !== id));
      } else {
        console.error("Failed to delete the item on the server.");
      }

      } catch (error) {
        console.error("Error connecting to the API:", error);
      }
    };

    return (
        <div className="container">
            <h1>Advanced State Todo</h1>
            
            {/* Manual Fetch Trigger */}
            <button onClick={loadTodos} disabled={state.isLoading}>
                {state.isLoading ? 'Loading...' : 'Load Data from API'}
            </button>

            {state.error && <div style={{ color: 'red', marginTop: '10px' }}>{state.error}</div>}

            <form onSubmit={addTodo} style={{ marginTop: '20px' }}>
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={state.newTaskInput}
                    onChange={(e) => updateState({ newTaskInput: e.target.value })}
                    disabled={state.isLoading}
                />
                <button type="submit" disabled={state.isLoading || !state.newTaskInput.trim()}>
                    Add
                </button>
            </form>

            <ul>
                {state.todos.length === 0 && !state.isLoading && <li>No tasks loaded.</li>}
                {state.todos.map((todo) => (
                    <li key={todo.id} style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>
                        <input
                            type="checkbox"
                            checked={todo.isCompleted}
                            onChange={() => toggleCompletion(todo)}
                            disabled={state.isLoading}
                        />
                        {todo.task}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;