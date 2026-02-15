'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { KanbanColumn } from './kanban-column';

interface Column {
  id: string;
  name: string;
  position: number;
  board_id: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  column_id: string;
  position: number;
  priority: string;
  created_at: string;
}

interface KanbanBoardProps {
  boardId: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadColumns();
    loadTasks();
  }, [boardId]);

  const loadColumns = async () => {
    const { data } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (data) {
      setColumns(data);
    }
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, columns!inner(board_id)')
      .eq('columns.board_id', boardId)
      .order('position', { ascending: true });

    if (data) {
      setTasks(data);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDrop = async (columnId: string) => {
    if (!draggedTask) return;

    if (draggedTask.column_id === columnId) {
      setDraggedTask(null);
      return;
    }

    const tasksInColumn = tasks.filter(t => t.column_id === columnId);
    const newPosition = tasksInColumn.length;

    await supabase
      .from('tasks')
      .update({ column_id: columnId, position: newPosition })
      .eq('id', draggedTask.id);

    setTasks(tasks.map(t =>
      t.id === draggedTask.id
        ? { ...t, column_id: columnId, position: newPosition }
        : t
    ));

    setDraggedTask(null);
  };

  const handleTaskCreate = async (columnId: string, title: string, description: string) => {
    const tasksInColumn = tasks.filter(t => t.column_id === columnId);
    const position = tasksInColumn.length;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        column_id: columnId,
        title,
        description,
        position,
        priority: 'medium'
      }])
      .select()
      .single();

    if (!error && data) {
      setTasks([...tasks, data]);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const handleTaskDelete = async (taskId: string) => {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    setTasks(tasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks.filter(t => t.column_id === column.id)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onTaskCreate={handleTaskCreate}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      ))}
    </div>
  );
}
