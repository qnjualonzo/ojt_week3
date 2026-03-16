import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import API from '../services/api';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';

// Register the chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ActivityChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                // This calls the router.get("/stats", ...) we added earlier
                const { data } = await API.get('/activities/stats');
                
                setChartData({
                    labels: data.map(row => row.task_date),
                    datasets: [{
                        label: 'Tasks per Day',
                        data: data.map(row => row.task_count),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    }]
                });
            } catch (err) {
                console.error("Chart load failed:", err);
            }
        };
        loadStats();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'OJT Task Frequency' },
        },
    };

    return (
        <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px' 
        }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default ActivityChart;