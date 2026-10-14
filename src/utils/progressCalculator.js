export function workoutVolume(workout) {
  return (workout.exercises || []).reduce((total, exercise) =>
    total + (exercise.sets || []).reduce((sum, set) =>
      sum + (set.completed ? (Number(set.weight) || 0) * (Number(set.reps) || 0) : 0), 0), 0);
}
export function getExerciseHistory(workouts, exerciseId) {
  return workouts.filter((workout) => workout.completed).map((workout) => {
    const exercise = (workout.exercises || []).find((item) => item.exerciseId === exerciseId);
    if (!exercise) return null;
    const sets = (exercise.sets || []).filter((set) => set.completed);
    if (!sets.length) return null;
    return {
      date: new Date(workout.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      weight: Math.max(...sets.map((set) => Number(set.weight) || 0)),
      reps: sets.reduce((sum, set) => sum + (Number(set.reps) || 0), 0),
      volume: sets.reduce((sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0)
    };
  }).filter(Boolean);
}
export function getPersonalRecords(workouts) {
  const records = {};
  workouts.filter((workout) => workout.completed).forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      (exercise.sets || []).filter((set) => set.completed).forEach((set) => {
        const weight = Number(set.weight) || 0;
        if (!records[exercise.exerciseId] || weight > records[exercise.exerciseId].weight) {
          records[exercise.exerciseId] = { exerciseId: exercise.exerciseId, weight, reps: Number(set.reps) || 0, date: workout.date };
        }
      });
    });
  });
  return Object.values(records).sort((a, b) => b.weight - a.weight).slice(0, 5);
}
