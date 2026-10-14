export const EXERCISES = [
  { id: "bench", name: "Barbell Bench Press", muscle: "Chest", equipment: "Barbell", reps: "8–12", sets: 3, rest: 120, instructions: "Keep shoulder blades set, lower with control, and press without bouncing." },
  { id: "incline-db", name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Dumbbells", reps: "8–12", sets: 3, rest: 120, instructions: "Use a slight incline and lower the dumbbells to a comfortable depth." },
  { id: "cable-fly", name: "Cable Fly", muscle: "Chest", equipment: "Cable", reps: "10–15", sets: 2, rest: 75, instructions: "Keep a soft bend in the elbows and bring your arms together smoothly." },
  { id: "lat-pulldown", name: "Lat Pulldown", muscle: "Back", equipment: "Cable", reps: "8–12", sets: 3, rest: 100, instructions: "Pull toward the upper chest while keeping your torso steady." },
  { id: "chest-row", name: "Chest-Supported Row", muscle: "Back", equipment: "Machine", reps: "8–12", sets: 3, rest: 100, instructions: "Drive elbows back and avoid shrugging or swinging." },
  { id: "seated-row", name: "Seated Cable Row", muscle: "Back", equipment: "Cable", reps: "8–12", sets: 3, rest: 100, instructions: "Keep a tall torso and pull toward your lower ribs." },
  { id: "rdl", name: "Romanian Deadlift", muscle: "Hamstrings / Glutes", equipment: "Barbell", reps: "6–10", sets: 3, rest: 150, instructions: "Push hips back, keep the bar close, and stop when your hamstrings limit the hinge." },
  { id: "squat", name: "Barbell Squat", muscle: "Quads / Glutes", equipment: "Barbell", reps: "6–10", sets: 3, rest: 150, instructions: "Brace your trunk and use a controlled, pain-free range of motion." },
  { id: "leg-press", name: "Leg Press", muscle: "Quads / Glutes", equipment: "Machine", reps: "10–15", sets: 3, rest: 120, instructions: "Keep your lower back supported and avoid locking the knees forcefully." },
  { id: "leg-curl", name: "Seated Leg Curl", muscle: "Hamstrings", equipment: "Machine", reps: "10–15", sets: 3, rest: 75, instructions: "Move smoothly and pause briefly at the contracted position." },
  { id: "calf", name: "Standing Calf Raise", muscle: "Calves", equipment: "Machine", reps: "10–15", sets: 3, rest: 60, instructions: "Use a comfortable stretch and full controlled ankle movement." },
  { id: "shoulder-press", name: "Seated Shoulder Press", muscle: "Shoulders", equipment: "Dumbbells", reps: "8–12", sets: 3, rest: 100, instructions: "Keep ribs down and press in a comfortable path overhead." },
  { id: "lateral", name: "Dumbbell Lateral Raise", muscle: "Side Delts", equipment: "Dumbbells", reps: "12–20", sets: 3, rest: 60, instructions: "Raise with control; avoid swinging or shrugging excessively." },
  { id: "face-pull", name: "Face Pull", muscle: "Rear Delts / Upper Back", equipment: "Cable", reps: "12–20", sets: 2, rest: 60, instructions: "Pull the rope toward face level with elbows comfortably out." },
  { id: "curl", name: "Dumbbell Curl", muscle: "Biceps", equipment: "Dumbbells", reps: "8–12", sets: 3, rest: 60, instructions: "Keep elbows near your sides and avoid swinging." },
  { id: "hammer", name: "Hammer Curl", muscle: "Biceps / Forearms", equipment: "Dumbbells", reps: "10–15", sets: 2, rest: 60, instructions: "Keep palms facing each other and use controlled reps." },
  { id: "pushdown", name: "Cable Triceps Pushdown", muscle: "Triceps", equipment: "Cable", reps: "10–15", sets: 3, rest: 60, instructions: "Keep elbows tucked and extend without moving the shoulders." },
  { id: "overhead-triceps", name: "Overhead Triceps Extension", muscle: "Triceps", equipment: "Cable / Dumbbell", reps: "10–15", sets: 2, rest: 60, instructions: "Keep upper arms steady and use a comfortable stretch." },
  { id: "plank", name: "Plank", muscle: "Core", equipment: "Bodyweight", reps: "30–60 sec", sets: 3, rest: 45, instructions: "Keep a straight line from shoulders to heels and breathe steadily." },
  { id: "deadbug", name: "Dead Bug", muscle: "Core", equipment: "Bodyweight", reps: "8–12 / side", sets: 2, rest: 45, instructions: "Keep your lower back gently braced against the floor." },
  { id: "split-squat", name: "Dumbbell Split Squat", muscle: "Quads / Glutes", equipment: "Dumbbells", reps: "8–12 / side", sets: 2, rest: 90, instructions: "Use a stable stance and lower under control." },
  { id: "hip-thrust", name: "Hip Thrust", muscle: "Glutes", equipment: "Barbell / Machine", reps: "8–12", sets: 3, rest: 100, instructions: "Keep ribs down and finish by extending the hips, not over-arching the back." }
];

export const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((exercise) => [exercise.id, exercise]));
