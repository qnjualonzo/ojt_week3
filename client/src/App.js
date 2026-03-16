import React, { useState, useEffect } from 'react';
import { fetchActivities, deleteActivity } from './services/api';
import ActivityForm from './features/ActivityForm'; 
import AuthPage from './components/AuthPage'; 
import ActivityChart from './components/ActivityChart'; // Added the chart for visualization
import { generatePDF, generateExcel } from './utils/exportService'; // Import your report tools

function App() {
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const loadActivities = async () => {
    try {
      const { data } = await fetchActivities();
      setActivities(data);
    } catch (err) {
      console.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  const handleLoginSuccess = (username) => {
    localStorage.setItem('username', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setActivities([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      await deleteActivity(id);
      loadActivities();
    }
  };

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header style={styles.header}>
        <h1>OJT Task App</h1>
        <div style={styles.userSection}>
          {/* New Export Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginRight: '20px' }}>
            <button onClick={() => generatePDF(activities, user)} style={styles.pdfBtn}>
              📄 PDF Report
            </button>
            <button onClick={() => generateExcel(activities, user)} style={styles.excelBtn}>
              📊 Excel Export
            </button>
          </div>
          
          <span>Welcome, <strong>{user}</strong></span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>
      
      <main style={{ padding: '20px' }}>
        {/* Data Visualization Section */}
        <div style={{ marginBottom: '30px' }}>
             <ActivityChart />
        </div>

        <ActivityForm 
          onActivityAdded={loadActivities} 
          editingActivity={editingActivity} 
          clearEdit={() => setEditingActivity(null)} 
        />

        <div className="task-list" style={styles.taskList}>
          <h3>Your Current Tasks</h3>
          {activities.length === 0 ? <p>No tasks found. Add one above!</p> : null}
          {activities.map(task => (
            <div key={task.id} className="task-card" style={styles.card}>
              <div style={{ flex: 1 }}>
                <h4>{task.title}</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{task.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setEditingActivity(task)}>Edit</button>
                <button onClick={() => handleDelete(task.id)} style={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 40px',
    backgroundColor: '#333',
    color: 'white'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center'
  },
  pdfBtn: {
    padding: '8px 12px',
    backgroundColor: '#e74c3c', // Red for PDF
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  excelBtn: {
    padding: '8px 12px',
    backgroundColor: '#27ae60', // Green for Excel
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  logoutBtn: {
    padding: '5px 15px',
    cursor: 'pointer',
    backgroundColor: '#555',
    color: 'white',
    border: '1px solid #777',
    borderRadius: '4px',
    marginLeft: '15px'
  },
  deleteBtn: {
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  taskList: {
    marginTop: '30px'
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff',
    marginBottom: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }
};

export default App;