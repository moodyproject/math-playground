import * as THREE from 'three';

export function vectorMagnitude(v: THREE.Vector3): number {
  return v.length();
}

export function dotProduct(a: THREE.Vector3, b: THREE.Vector3): number {
  return a.dot(b);
}

export function angleBetween(a: THREE.Vector3, b: THREE.Vector3): number {
  const dot = a.dot(b);
  const magA = a.length();
  const magB = b.length();
  if (magA === 0 || magB === 0) return 0;
  return Math.acos(THREE.MathUtils.clamp(dot / (magA * magB), -1, 1));
}

export function projectOnto(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
  const bNorm = b.clone().normalize();
  const scalar = a.dot(bNorm);
  return bNorm.multiplyScalar(scalar);
}
