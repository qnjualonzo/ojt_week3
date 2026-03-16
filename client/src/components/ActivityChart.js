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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ActivityChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const { data } = await API.get('/activities/stats');
                
                setChartData({
                    labels: data.map(row => row.task_date),
                    datasets: [{
                        label: 'Tasks',
                        data: data.map(row => row.task_count),
                        backgroundColor: '#000000',
                        borderColor: '#000000',
                        borderWidth: 0,
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
            legend: { 
                display: false 
            },
            title: { 
                display: false 
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#000000',
                    font: {
                        family: "'SF Mono', 'Consolas', monospace",
                        size: 10,
                    }
                },
                border: {
                    color: '#000000',
                    width: 2,
                }
            },
            y: {
                grid: {
                    color: '#cccccc',
                },
                ticks: {
                    color: '#000000',
                    font: {
                        family: "'SF Mono', 'Consolas', monospace",
                        size: 10,
                    }
                },
                border: {
                    color: '#000000',
                    width: 2,
                }
            }
        }
    };

    return (
        <div className="chart-wrapper">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default ActivityChart;