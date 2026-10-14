const STORAGE_KEY = "forge-gym-tracker-v1";
export function loadAppData() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
export function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Unable to save app data", error);
  }
}
export function clearAppData() {
  localStorage.removeItem(STORAGE_KEY);
}
