'use client';

import { useState } from 'react';
import { TaskCard } from './task-card';

interface Column {
  id: string;
  name: string;
  position: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  column_id: string;
  position: number;
  priority: string;
  urgency: string;
  due_date: string | null;
  estimated_hours: number;
  status: string;
  created_at: string;
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onDragStart: (task: Task) => void;
  onDrop: (columnId: string) => void;
  onTaskCreate: (columnId: string, title: string, description: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onDragStart,
  onDrop,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}: KanbanColumnProps) {
  const [showForm, setShowForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.id);
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onTaskCreate(column.id, newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowForm(false);
    }
  };

  return (
    <div
      className={`flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 transition-colors ${
        isDragOver ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-500' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{tasks.length}</span>
      </div>

      <div className="space-y-3 mb-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onUpdate={onTaskUpdate}
            onDelete={onTaskDelete}
          />
        ))}
      </div>

      {showForm ? (
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            autoFocus
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-2 text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateTask}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
              className="px-3 py-1.5 text-gray-700 dark:text-gray-300 text-sm hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          + Add Task
        </button>
      )}
    </div>
  );
}
