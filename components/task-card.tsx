'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  column_id: string;
  position: number;
  priority: string;
  created_at: string;
}

interface TaskCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onDragStart, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority);

  const handleDragStart = () => {
    onDragStart(task);
  };

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-sm font-medium"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-sm resize-none"
          rows={3}
        />
        <select
          value={editPriority}
          onChange={(e) => setEditPriority(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-sm"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-gray-700 text-xs hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this task?')) {
                onDelete(task.id);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 ml-auto"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => setIsEditing(true)}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm flex-1">{task.title}</h4>
        <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>
      )}
    </div>
  );
}
