export function feetInchesToCm(feet, inches) {
  return (Number(feet) * 12 + Number(inches)) * 2.54;
}
export function cmToFeetInches(cm) {
  const totalInches = Number(cm) / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches - feet * 12) * 10) / 10;
  return { feet: inches >= 12 ? feet + 1 : feet, inches: inches >= 12 ? 0 : inches };
}
export function formatHeight(cm) {
  if (!cm || !Number.isFinite(Number(cm))) return "Not set";
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}′ ${inches}″ · ${Math.round(cm)} cm`;
}
