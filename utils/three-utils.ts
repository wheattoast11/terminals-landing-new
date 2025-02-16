import * as THREE from 'three';

export function disposeThreeObject(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as any).geometry) {
      (child as any).geometry.dispose();
    }
    if ((child as any).material) {
      const material = (child as any).material;
      if (Array.isArray(material)) {
        material.forEach(mat => {
          if (mat && typeof mat.dispose === 'function') {
            mat.dispose();
          }
        });
      } else if (material && typeof material.dispose === 'function') {
        material.dispose();
      }
    }
  });
} 