const planTemplates = {
  2: [
    { name: "Full Body A", focus: "Full body · squat and horizontal push", ids: ["squat", "bench", "seated-row", "rdl", "lateral", "plank"] },
    { name: "Full Body B", focus: "Full body · hinge and vertical pull", ids: ["rdl", "incline-db", "lat-pulldown", "leg-press", "curl", "pushdown"] }
  ],
  3: [
    { name: "Full Body A", focus: "Full body · squat and push", ids: ["squat", "bench", "seated-row", "leg-curl", "lateral", "plank"] },
    { name: "Full Body B", focus: "Full body · hinge and pull", ids: ["rdl", "incline-db", "lat-pulldown", "split-squat", "curl", "pushdown"] },
    { name: "Full Body C", focus: "Full body · balanced volume", ids: ["leg-press", "shoulder-press", "chest-row", "hip-thrust", "hammer", "deadbug"] }
  ],
  4: [
    { name: "Upper A", focus: "Chest, back, shoulders, arms", ids: ["bench", "lat-pulldown", "shoulder-press", "seated-row", "curl", "pushdown"] },
    { name: "Lower A", focus: "Quads, hamstrings, glutes, core", ids: ["squat", "rdl", "leg-curl", "calf", "plank"] },
    { name: "Upper B", focus: "Upper body · alternate angles", ids: ["incline-db", "chest-row", "lateral", "face-pull", "hammer", "overhead-triceps"] },
    { name: "Lower B", focus: "Lower body · balanced", ids: ["leg-press", "hip-thrust", "split-squat", "leg-curl", "calf", "deadbug"] }
  ],
  5: [
    { name: "Upper", focus: "Chest, back, shoulders, arms", ids: ["bench", "lat-pulldown", "shoulder-press", "seated-row", "curl", "pushdown"] },
    { name: "Lower", focus: "Quads, hamstrings, glutes, core", ids: ["squat", "rdl", "leg-curl", "calf", "plank"] },
    { name: "Push", focus: "Chest, shoulders, triceps", ids: ["incline-db", "cable-fly", "shoulder-press", "lateral", "pushdown"] },
    { name: "Pull", focus: "Back, rear delts, biceps", ids: ["lat-pulldown", "chest-row", "face-pull", "curl", "hammer"] },
    { name: "Legs + Core", focus: "Lower body and abs", ids: ["leg-press", "hip-thrust", "split-squat", "leg-curl", "calf", "deadbug"] }
  ],
  6: [
    { name: "Push A", focus: "Chest, shoulders, triceps", ids: ["bench", "shoulder-press", "cable-fly", "lateral", "pushdown"] },
    { name: "Pull A", focus: "Back, rear delts, biceps", ids: ["lat-pulldown", "seated-row", "face-pull", "curl", "hammer"] },
    { name: "Legs A", focus: "Quads, hamstrings, glutes", ids: ["squat", "rdl", "leg-curl", "calf", "plank"] },
    { name: "Push B", focus: "Upper-body push variations", ids: ["incline-db", "cable-fly", "lateral", "overhead-triceps", "pushdown"] },
    { name: "Pull B", focus: "Back and biceps variations", ids: ["chest-row", "lat-pulldown", "face-pull", "hammer", "curl"] },
    { name: "Legs B", focus: "Lower-body variations", ids: ["leg-press", "hip-thrust", "split-squat", "leg-curl", "calf", "deadbug"] }
  ]
};

export function generateWorkoutPlan(days, experience = "Beginner", goal = "Muscle Gain") {
  const count = Number(days);
  const template = planTemplates[count] || planTemplates[3];
  const setFactor = experience === "Beginner" ? 0.85 : experience === "Advanced" ? 1.1 : 1;
  return template.map((day, index) => ({
    id: `day-${count}-${index + 1}`,
    name: day.name,
    focus: day.focus,
    exercises: day.ids.map((id) => {
      const base = { "squat": 3, "rdl": 3, "bench": 3, "incline-db": 3, "lat-pulldown": 3, "seated-row": 3, "chest-row": 3 };
      let sets = base[id] || 2;
      if (goal === "Strength" && ["squat", "rdl", "bench", "shoulder-press"].includes(id)) sets = 4;
      if (setFactor < 1 && sets > 2) sets -= 1;
      return { exerciseId: id, sets, weight: "", targetReps: null };
    })
  }));
}
