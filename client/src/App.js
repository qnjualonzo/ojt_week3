import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useActivities from './hooks/useActivities';
import ActivityForm from './features/ActivityForm'; 
import AuthPage from './components/AuthPage'; 
import ActivityChart from './components/ActivityChart';
import { generatePDF, generateExcel } from './utils/exportService';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [chartExpanded, setChartExpanded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) setUser(savedUser);
  }, []);

  const {
    activities, setActivities, editingActivity, setEditingActivity,
    loadActivities, handleDelete,
    page, totalPages, goToPage,
  } = useActivities(user);

  const handleLoginSuccess = (username) => {
    localStorage.setItem('username', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(activities);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setActivities(items);
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const isOverdue = date < now;
    const formatted = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return { formatted, isOverdue };
  };

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Tasklith</h1>
        <div className="user-section">
          <div className="export-buttons">
            <button onClick={() => generatePDF(activities, user)} className="btn btn-pdf">
              PDF
            </button>
            <button onClick={() => generateExcel(activities, user)} className="btn btn-excel">
              Excel
            </button>
          </div>
          <span>{user}</span>
          <button onClick={handleLogout} className="btn btn-logout">Exit</button>
        </div>
      </header>
      
      <main className="app-main">
        <div className="chart-section">
          <button 
            className="chart-toggle" 
            onClick={() => setChartExpanded(!chartExpanded)}
          >
            <span>Statistics</span>
            <span>{chartExpanded ? '−' : '+'}</span>
          </button>
          <div className={`chart-content ${chartExpanded ? '' : 'collapsed'}`}>
            <ActivityChart />
          </div>
        </div>

        <ActivityForm 
          onActivityAdded={loadActivities} 
          editingActivity={editingActivity} 
          clearEdit={() => setEditingActivity(null)} 
        />

        <div className="task-list">
          <h3>Tasks ({activities.length})</h3>
          
          {activities.length === 0 ? (
            <div className="empty-state">No tasks yet. Create one above.</div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {activities.map((task, index) => {
                      const deadlineInfo = formatDeadline(task.deadline);
                      return (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <span {...provided.dragHandleProps} className="drag-handle">⠿</span>
                              <div className="task-content">
                                <h4>{task.title}</h4>
                                <p className="task-description">{task.description}</p>
                                <div className="task-meta">
                                  {deadlineInfo && (
                                    <span className={`deadline ${deadlineInfo.isOverdue ? 'overdue' : ''}`}>
                                      {deadlineInfo.isOverdue ? 'OVERDUE: ' : 'Due: '}{deadlineInfo.formatted}
                                    </span>
                                  )}
                                  {task.drive_link && <span>File attached</span>}
                                </div>
                              </div>
                              <div className="task-actions">
                                <button className="btn" onClick={() => setEditingActivity(task)}>Edit</button>
                                <button className="btn btn-delete" onClick={() => handleDelete(task.id)}>Delete</button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => goToPage(page - 1)} disabled={page <= 1}>← Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>Next →</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;