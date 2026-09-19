import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA, FOCUS_OFFSET, REDUCED_MOTION } from './constants';
import { StreetController } from './StreetController';

interface CameraRigProps {
  controller: StreetController;
}

/** Camera rides the rank axis. Slight dolly-in on first paint, then it only moves with the thumb. */
export function CameraRig({ controller }: CameraRigProps) {
  const { camera, size } = useThree();
  const smoothX = useRef(controller.x);
  const intro = useRef({ start: -1, dur: REDUCED_MOTION ? 0 : 1500 });
  const look = useRef(new THREE.Vector3());

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = CAMERA.fov;
    cam.near = 0.5;
    cam.far = 320;
    cam.updateProjectionMatrix();
  }, [camera]);

  useFrame((_, dt) => {
    const now = performance.now();
    const cam = camera as THREE.PerspectiveCamera;
    controller.update(now, Math.min(dt, 0.05));

    // world units per CSS pixel at the tower plane, so a drag tracks the finger 1:1
    const visibleH = 2 * CAMERA.distance * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const visibleW = visibleH * (size.width / size.height);
    controller.unitsPerPx = visibleW / size.width;

    const k = controller.isDragging ? 1 - Math.pow(0.000001, dt) : 1 - Math.pow(0.0008, dt);
    smoothX.current += (controller.x - smoothX.current) * k;

    if (intro.current.start < 0) intro.current.start = now;
    const t = intro.current.dur > 0 ? Math.min(1, (now - intro.current.start) / intro.current.dur) : 1;
    const e = 1 - Math.pow(1 - t, 3);
    const dist = CAMERA.distance + (1 - e) * 7;
    const height = CAMERA.height + (1 - e) * 2.2;

    const fx = smoothX.current + FOCUS_OFFSET;
    cam.position.set(fx + CAMERA.yaw, height, dist);
    look.current.set(fx, CAMERA.lookY, 0);
    cam.lookAt(look.current);
  });

  return null;
}
