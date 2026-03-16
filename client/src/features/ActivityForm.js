import React, { useState, useEffect } from 'react';
import { createActivity, updateActivity } from '../services/api';

function ActivityForm({ onActivityAdded, editingActivity, clearEdit }) {
  const [tasks, setTasks] = useState([{ title: '', description: '', deadline: '', file: null }]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (editingActivity) {
      setTasks([{
        title: editingActivity.title,
        description: editingActivity.description,
        deadline: editingActivity.deadline ? new Date(editingActivity.deadline).toISOString().slice(0, 16) : '',
        file: null
      }]);
    } else {
      setTasks([{ title: '', description: '', deadline: '', file: null }]);
    }
  }, [editingActivity]);

  const addRow = () => {
    setTasks([...tasks, { title: '', description: '', deadline: '', file: null }]);
  };

  const removeRow = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleInputChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  // Quick date helpers
  const setQuickDate = (index, daysFromNow, hour = 17) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    const formatted = date.toISOString().slice(0, 16);
    handleInputChange(index, 'deadline', formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      if (editingActivity) {
        const formData = new FormData();
        formData.append('title', tasks[0].title);
        formData.append('description', tasks[0].description);
        formData.append('deadline', tasks[0].deadline);
        if (tasks[0].file) formData.append('file', tasks[0].file);
        else if (editingActivity.drive_link) formData.append('existing_link', editingActivity.drive_link);

        await updateActivity(editingActivity.id, formData);
      } else {
        for (const task of tasks) {
          const formData = new FormData();
          formData.append('title', task.title);
          formData.append('description', task.description);
          formData.append('deadline', task.deadline);
          if (task.file) formData.append('file', task.file);
          await createActivity(formData);
        }
      }

      setStatus({ type: 'success', message: `Saved ${tasks.length} task(s)` });
      setTasks([{ title: '', description: '', deadline: '', file: null }]);
      onActivityAdded();
      if (editingActivity) setTimeout(() => clearEdit(), 1500);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);

    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to save task(s)' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <h3>{editingActivity ? "Edit Task" : "Add Tasks"}</h3>
      
      {status.message && (
        <div className={`status-banner ${status.type}`}>{status.message}</div>
      )}

      <form onSubmit={handleSubmit}>
        {tasks.map((task, index) => (
          <div key={index} className="task-row">
            <div className="task-row-header">
              <span className="task-row-number">Task #{index + 1}</span>
              {tasks.length > 1 && !editingActivity && (
                <button type="button" onClick={() => removeRow(index)} className="remove-row-btn">
                  Remove
                </button>
              )}
            </div>
            
            <div className="form-row">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                required
                value={task.title} 
                onChange={(e) => handleInputChange(index, 'title', e.target.value)} 
                className="form-input"
                placeholder="What needs to be done?"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Description</label>
              <textarea 
                required
                value={task.description} 
                onChange={(e) => handleInputChange(index, 'description', e.target.value)} 
                className="form-textarea"
                placeholder="Details..."
              />
            </div>

            <div className="form-grid">
              <div className="form-row">
                <label className="form-label">Deadline</label>
                <input 
                  type="datetime-local" 
                  required
                  value={task.deadline} 
                  onChange={(e) => handleInputChange(index, 'deadline', e.target.value)}
                  className="form-input"
                />
                <div className="quick-dates">
                  <button type="button" className="quick-date-btn" onClick={() => setQuickDate(index, 0)}>
                    Today
                  </button>
                  <button type="button" className="quick-date-btn" onClick={() => setQuickDate(index, 1)}>
                    Tomorrow
                  </button>
                  <button type="button" className="quick-date-btn" onClick={() => setQuickDate(index, 7)}>
                    +1 Week
                  </button>
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Attachment</label>
                <input 
                  type="file" 
                  onChange={(e) => handleInputChange(index, 'file', e.target.files[0])} 
                  className="form-input"
                  style={{ padding: '8px' }}
                />
              </div>
            </div>
          </div>
        ))}

        {!editingActivity && (
          <button type="button" onClick={addRow} className="add-row-btn">
            + Add Another Task
          </button>
        )}
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : (editingActivity ? 'Update' : `Save (${tasks.length})`)}
          </button>

          {editingActivity && (
            <button type="button" onClick={clearEdit} className="btn">Cancel</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ActivityForm;