import React, { useState, useEffect } from 'react';
import { fetchActivities, deleteActivity } from './services/api';
import ActivityForm from './features/ActivityForm'; // Adjust path if needed

function App() {
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);

  const loadActivities = async () => {
    try {
      const { data } = await fetchActivities();
      setActivities(data);
    } catch (err) {
      console.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      await deleteActivity(id);
      loadActivities();
    }
  };

  return (
    <div className="App">
      <h1>OJT Task Tracker</h1>
      
      <ActivityForm 
        onActivityAdded={loadActivities} 
        editingActivity={editingActivity} 
        clearEdit={() => setEditingActivity(null)} 
      />

      <div className="task-list">
        {activities.map(task => (
          <div key={task.id} className="task-card">
            <h4>{task.title}</h4>
            <button onClick={() => setEditingActivity(task)}>Edit</button>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;