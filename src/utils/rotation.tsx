export function getRotationAngleForColor(color: string): number {
  switch (color.toLowerCase()) {
    case "red":
        return Math.PI;
    case "blue":
      return Math.PI / 2; // 90° clockwise
    case "green":
      return -Math.PI / 2; // 180°
    case "yellow":
      return 0; // 270° or -90°
    default:
      return 0;
  }
}