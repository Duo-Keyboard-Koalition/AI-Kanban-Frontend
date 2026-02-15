'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

interface Prerequisite {
  prerequisite_task_id: string;
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
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editUrgency, setEditUrgency] = useState(task.urgency || 'medium');
  const [editDueDate, setEditDueDate] = useState(task.due_date || '');
  const [editEstimatedHours, setEditEstimatedHours] = useState(task.estimated_hours || 0);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);

  useEffect(() => {
    loadPrerequisites();
  }, [task.id]);

  const loadPrerequisites = async () => {
    const { data } = await supabase
      .from('task_prerequisites')
      .select('prerequisite_task_id')
      .eq('task_id', task.id);

    if (data) {
      setPrerequisites(data);
    }
  };

  const handleDragStart = () => {
    onDragStart(task);
  };

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      urgency: editUrgency,
      due_date: editDueDate || null,
      estimated_hours: editEstimatedHours
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority || 'medium');
    setEditUrgency(task.urgency || 'medium');
    setEditDueDate(task.due_date || '');
    setEditEstimatedHours(task.estimated_hours || 0);
    setIsEditing(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md mb-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md mb-2 text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Urgency</label>
            <select
              value={editUrgency}
              onChange={(e) => setEditUrgency(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Priority</label>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Due Date</label>
            <input
              type="date"
              value={editDueDate ? new Date(editDueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Est. Hours</label>
            <input
              type="number"
              value={editEstimatedHours}
              onChange={(e) => setEditEstimatedHours(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-gray-700 dark:text-gray-300 text-xs hover:text-gray-900 dark:hover:text-white"
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
      className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm flex-1 pr-2">{task.title}</h4>
        <span className={`px-2 py-0.5 text-xs rounded-full border ${getUrgencyColor(task.urgency || 'medium')}`}>
          {task.urgency || 'medium'}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        {task.due_date && (
          <span className={`px-2 py-0.5 rounded ${isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
            📅 {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        {task.estimated_hours > 0 && (
          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
            ⏱️ {task.estimated_hours}h
          </span>
        )}
        {prerequisites.length > 0 && (
          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" title={`Has ${prerequisites.length} prerequisite${prerequisites.length > 1 ? 's' : ''}`}>
            🔗 {prerequisites.length}
          </span>
        )}
      </div>
    </div>
  );
}
