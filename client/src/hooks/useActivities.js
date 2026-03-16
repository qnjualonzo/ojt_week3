import { useState, useEffect, useCallback } from 'react';
import { fetchActivities, deleteActivity } from '../services/api';

export default function useActivities(user) {
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadActivities = useCallback(async (pageNum = page) => {
    if (!user) return;
    try {
      const { data } = await fetchActivities(pageNum);
      setActivities(data.activities);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to load tasks");
    }
  }, [user, page]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      try {
        await deleteActivity(id);
        loadActivities();
      } catch (err) {
        console.error("Failed to delete task:", err);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const goToPage = (pageNum) => {
    setPage(pageNum);
    loadActivities(pageNum);
  };

  return {
    activities,
    setActivities,
    editingActivity,
    setEditingActivity,
    loadActivities,
    handleDelete,
    page,
    totalPages,
    goToPage,
  };
}
