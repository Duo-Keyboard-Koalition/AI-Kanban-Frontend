'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { KanbanBoard } from './kanban-board';

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Board {
  id: string;
  name: string;
  project_id: string;
}

interface MyTask {
  id: string;
  title: string;
  urgency: string;
  due_date: string | null;
}

export function Dashboard() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [sidebarView, setSidebarView] = useState<'projects' | 'my-tasks' | 'team'>('projects');
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);

  useEffect(() => {
    loadProjects();
    loadMyTasks();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadBoards(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    }
  };

  const loadBoards = async (projectId: string) => {
    const { data } = await supabase
      .from('boards')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) {
      setBoards(data);
      if (data.length > 0) {
        setSelectedBoard(data[0]);
      } else {
        setSelectedBoard(null);
      }
    }
  };

  const loadMyTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, urgency, due_date')
      .eq('assignee_id', user?.id)
      .order('due_date', { ascending: true });

    if (data) {
      setMyTasks(data);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: newProjectName, description: newProjectDescription, owner_id: user?.id }])
      .select()
      .single();

    if (!error && data) {
      setProjects([data, ...projects]);
      setSelectedProject(data);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowProjectForm(false);

      await createDefaultBoard(data.id);
    }
  };

  const createDefaultBoard = async (projectId: string) => {
    const { data: board } = await supabase
      .from('boards')
      .insert([{ name: 'Main Board', project_id: projectId }])
      .select()
      .single();

    if (board) {
      const defaultColumns = [
        { name: 'To Do', position: 0, board_id: board.id },
        { name: 'In Progress', position: 1, board_id: board.id },
        { name: 'Review', position: 2, board_id: board.id },
        { name: 'Done', position: 3, board_id: board.id },
      ];

      await supabase.from('columns').insert(defaultColumns);
      loadBoards(projectId);
    }
  };

  const createBoard = async () => {
    if (!newBoardName.trim() || !selectedProject) return;

    const { data, error } = await supabase
      .from('boards')
      .insert([{ name: newBoardName, project_id: selectedProject.id }])
      .select()
      .single();

    if (!error && data) {
      const defaultColumns = [
        { name: 'To Do', position: 0, board_id: data.id },
        { name: 'In Progress', position: 1, board_id: data.id },
        { name: 'Review', position: 2, board_id: data.id },
        { name: 'Done', position: 3, board_id: data.id },
      ];

      await supabase.from('columns').insert(defaultColumns);

      setBoards([data, ...boards]);
      setSelectedBoard(data);
      setNewBoardName('');
      setShowBoardForm(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Project Manager</h1>

              <div className="flex items-center gap-2">
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p.id === e.target.value);
                    setSelectedProject(project || null);
                  }}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowProjectForm(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  + Project
                </button>
              </div>

              {selectedProject && (
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
                  <select
                    value={selectedBoard?.id || ''}
                    onChange={(e) => {
                      const board = boards.find(b => b.id === e.target.value);
                      setSelectedBoard(board || null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowBoardForm(true)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    + Board
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Project description (optional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showBoardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Board</h2>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Board name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowBoardForm(false);
                  setNewBoardName('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createBoard}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setSidebarView('projects')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  sidebarView === 'projects'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                📋 All Projects
              </button>
              <button
                onClick={() => setSidebarView('my-tasks')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  sidebarView === 'my-tasks'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                ✓ My Tasks ({myTasks.length})
              </button>
              <button
                onClick={() => setSidebarView('team')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  sidebarView === 'team'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                👥 Team View
              </button>
            </nav>

            {sidebarView === 'my-tasks' && myTasks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Assigned to You</h3>
                <div className="space-y-2">
                  {myTasks.slice(0, 10).map((task) => (
                    <div
                      key={task.id}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs font-medium ${getUrgencyColor(task.urgency || 'medium')}`}>
                          {task.urgency || 'medium'}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sidebarView === 'projects' && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Recent Projects</h3>
                <div className="space-y-2">
                  {projects.slice(0, 5).map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {selectedBoard ? (
            <KanbanBoard boardId={selectedBoard.id} />
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {selectedProject ? 'No boards yet. Create one to get started!' : 'Select or create a project to get started!'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
