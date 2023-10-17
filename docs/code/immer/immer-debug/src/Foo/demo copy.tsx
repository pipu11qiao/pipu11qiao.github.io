import React, { useCallback, useState } from 'react';
import { produce } from '../lib/immer';

const TodoList = () => {
  const [todos, setTodos] = useState([
    {
      id: 'React',
      title: 'Learn React',
      done: true,
    },
    {
      id: 'Immer',
      title: 'Try Immer',
      done: false,
    },
  ]);

  const handleToggle = useCallback((id: string) => {
    setTodos(
      produce((draft) => {
        const todo = draft.find((todo) => todo.id === id);
        if (todo) {
          todo.done = !todo.done;
        }
      }),
    );
  }, []);

  const handleAdd = useCallback(() => {
    setTodos(
      produce((draft) => {
        draft.push({
          id: 'todo_' + Math.random(),
          title: 'A new todo',
          done: false,
        });
      }),
    );
  }, []);

  return (
    <div>
      <h1>demo</h1>
      <div>
        {todos.map((item, i) => (
          <div key={i}>
            <div>{item.title}</div>
            <div>{item.done}</div>
            <div>
              <button
                type="button"
                onClick={() => {
                  handleToggle(item.id);
                }}
              >
                toggle
              </button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            handleAdd();
          }}
        >
          add
        </button>
      </div>
    </div>
  );
};

export default TodoList;
