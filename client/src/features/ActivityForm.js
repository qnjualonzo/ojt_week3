import React, { useState, useEffect } from 'react';
import { createActivity, updateActivity } from '../services/api';

function ActivityForm({ onActivityAdded, editingActivity, clearEdit }) {
  // Now managing an array of tasks for multiple additions
  const [tasks, setTasks] = useState([{ title: '', description: '', deadline: '', file: null }]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // If editing, we just use the first row of our state
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

  // Add a new blank row
  const addRow = () => {
    setTasks([...tasks, { title: '', description: '', deadline: '', file: null }]);
  };

  // Remove a specific row
  const removeRow = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  // Handle changes for a specific row
  const handleInputChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      if (editingActivity) {
        // Single Update logic
        const formData = new FormData();
        formData.append('title', tasks[0].title);
        formData.append('description', tasks[0].description);
        formData.append('deadline', tasks[0].deadline);
        if (tasks[0].file) formData.append('file', tasks[0].file);
        else if (editingActivity.drive_link) formData.append('existing_link', editingActivity.drive_link);

        await updateActivity(editingActivity.id, formData);
      } else {
        // Multi-Create logic: Send requests for each row
        // Note: For large batches, a single bulk-upload endpoint on the backend is better.
        for (const task of tasks) {
          const formData = new FormData();
          formData.append('title', task.title);
          formData.append('description', task.description);
          formData.append('deadline', task.deadline);
          if (task.file) formData.append('file', task.file);
          await createActivity(formData);
        }
      }

      setStatus({ type: 'success', message: `✅ Successfully processed ${tasks.length} task(s)!` });
      setTasks([{ title: '', description: '', deadline: '', file: null }]); // Reset to one blank row
      onActivityAdded();
      if (editingActivity) setTimeout(() => clearEdit(), 1500);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);

    } catch (err) {
      setStatus({ type: 'error', message: '❌ One or more tasks failed to save.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "12px", backgroundColor: "#ffffff", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <h3 style={{ marginTop: 0, color: "#333" }}>
        {editingActivity ? "📝 Edit Task" : "➕ Add Tasks"}
      </h3>
      
      {status.message && (
        <div style={statusBanner(status.type)}>{status.message}</div>
      )}

      <form onSubmit={handleSubmit}>
        {tasks.map((task, index) => (
          <div key={index} style={rowContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '12px', color: '#718096' }}>Task #{index + 1}</span>
               {tasks.length > 1 && !editingActivity && (
                 <button type="button" onClick={() => removeRow(index)} style={removeBtnStyle}>Remove Row</button>
               )}
            </div>
            
            <input 
              type="text" placeholder="Task Title" required
              value={task.title} onChange={(e) => handleInputChange(index, 'title', e.target.value)} 
              style={inputStyle}
            />
            <textarea 
              placeholder="Description" required
              value={task.description} onChange={(e) => handleInputChange(index, 'description', e.target.value)} 
              style={{ ...inputStyle, minHeight: "60px" }}
            />

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Deadline:</label>
                <input 
                  type="datetime-local" required
                  value={task.deadline} onChange={(e) => handleInputChange(index, 'deadline', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>File:</label>
                <input 
                  type="file" onChange={(e) => handleInputChange(index, 'file', e.target.files[0])} 
                  style={{ fontSize: '12px', marginTop: '5px' }}
                />
              </div>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid #edf2f7', margin: '15px 0' }} />
          </div>
        ))}

        {!editingActivity && (
          <button type="button" onClick={addRow} style={addMoreBtnStyle}>
            + Add Another Row
          </button>
        )}
        
        <div style={{ display: "flex", gap: "10px", marginTop: '20px' }}>
            <button type="submit" disabled={loading} style={buttonStyle(loading)}>
              {loading ? 'Processing...' : (editingActivity ? 'Update Task' : `Save ${tasks.length} Task(s)`)}
            </button>

            {editingActivity && (
              <button type="button" onClick={clearEdit} style={cancelButtonStyle}>Cancel</button>
            )}
        </div>
      </form>
    </div>
  );
}

// Styles
const rowContainer = { marginBottom: '20px' };
const labelStyle = { display: "block", fontSize: "11px", fontWeight: "bold", color: "#718096" };
const inputStyle = { display: "block", marginBottom: "8px", width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "14px" };
const statusBanner = (type) => ({ padding: '12px', marginBottom: '15px', borderRadius: '6px', backgroundColor: type === 'success' ? '#e6fffa' : '#fff5f5', color: type === 'success' ? '#234e52' : '#822727', border: `1px solid ${type === 'success' ? '#38b2ac' : '#feb2b2'}` });
const buttonStyle = (loading) => ({ flex: 1, padding: "12px", backgroundColor: loading ? "#a0aec0" : "#3182ce", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" });
const addMoreBtnStyle = { width: '100%', padding: '10px', backgroundColor: '#f7fafc', border: '1px dashed #cbd5e0', borderRadius: '6px', color: '#4a5568', cursor: 'pointer', fontWeight: 'bold' };
const removeBtnStyle = { background: 'none', border: 'none', color: '#e53e3e', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' };
const cancelButtonStyle = { padding: "12px 20px", backgroundColor: "#edf2f7", color: "#4a5568", border: "1px solid #cbd5e0", borderRadius: "6px", cursor: "pointer" };

export default ActivityForm;