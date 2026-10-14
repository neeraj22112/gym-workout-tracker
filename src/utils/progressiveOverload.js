export function getProgression(exerciseId, targetReps, currentSets, history) {
  const past = [...history]
    .filter((workout) => workout.completed)
    .reverse()
    .flatMap((workout) => (workout.exercises || [])
      .filter((exercise) => exercise.exerciseId === exerciseId)
      .map((exercise) => ({ workout, exercise })));
  const latest = past[0]?.exercise;
  if (!latest) {
    return { status: "Start here", message: "Log a session first. Choose a load that lets you finish with controlled technique and a few reps in reserve.", suggestedWeight: null };
  }

  const validSets = (latest.sets || []).filter((set) => set.completed && Number(set.weight) >= 0 && Number(set.reps) > 0);
  if (!validSets.length) {
    return { status: "Log a complete set", message: "Your last session has no completed working sets to compare.", suggestedWeight: null };
  }

  const repMatch = String(targetReps || "8–12").match(/(\d+)[^\d]+(\d+)/);
  const topRep = repMatch ? Number(repMatch[2]) : 12;
  const currentWeight = Math.max(...validSets.map((set) => Number(set.weight) || 0));
  const allAtTop = validSets.length >= Math.max(1, currentSets || 1) && validSets.every((set) => Number(set.reps) >= topRep);
  const lastSessionDate = latest.date || past[0].workout.date;

  if (allAtTop) {
    const increment = currentWeight >= 40 ? 2.5 : currentWeight >= 15 ? 1 : 0.5;
    return {
      status: "Ready to progress",
      message: `You reached ${topRep}+ reps across the logged sets on ${lastSessionDate}. If technique was solid and effort was appropriate, try a small increase next time.`,
      suggestedWeight: Math.round((currentWeight + increment) * 100) / 100
    };
  }

  const lowestReps = Math.min(...validSets.map((set) => Number(set.reps)));
  if (lowestReps < (repMatch ? Number(repMatch[1]) : 8)) {
    return { status: "Maintain or reduce", message: "Some sets fell below the target range. Repeat the load or reduce it slightly if technique or control was compromised.", suggestedWeight: currentWeight };
  }
  return { status: "Build repetitions", message: `Keep the load at ${currentWeight} kg and aim to add a rep where possible while maintaining good technique.`, suggestedWeight: currentWeight };
}
