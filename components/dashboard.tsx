'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
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

export function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    loadProjects();
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

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: newProjectName, owner_id: user?.id }])
      .select()
      .single();

    if (!error && data) {
      setProjects([data, ...projects]);
      setSelectedProject(data);
      setNewProjectName('');
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
        { name: 'Done', position: 2, board_id: board.id },
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
        { name: 'Done', position: 2, board_id: data.id },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Kanban Board</h1>

              <div className="flex items-center gap-2">
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p.id === e.target.value);
                    setSelectedProject(project || null);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
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
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
                  <select
                    value={selectedBoard?.id || ''}
                    onChange={(e) => {
                      const board = boards.find(b => b.id === e.target.value);
                      setSelectedBoard(board || null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
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
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  setNewProjectName('');
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
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
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Board</h2>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Board name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowBoardForm(false);
                  setNewBoardName('');
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
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

      <main className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
        {selectedBoard ? (
          <KanbanBoard boardId={selectedBoard.id} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            {selectedProject ? 'No boards yet. Create one to get started!' : 'Select or create a project to get started!'}
          </div>
        )}
      </main>
    </div>
  );
}
