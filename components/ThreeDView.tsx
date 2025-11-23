import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; // Import OBJLoader
import { STLLoader } from 'three/addons/loaders/STLLoader.js'; // Import STLLoader
import type { AnalysisResult } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Spinner } from './DesignRecommender'; // Reusing spinner from DesignRecommender

const ANGLE_COLORS = {
  RAKE: '#34d399',      // emerald-400
  RELIEF: '#60a5fa',     // blue-400
  CUTTING_EDGE: '#facc15', // yellow-400
  DEFAULT: '#a78bfa',   // violet-400
};

const getAngleColor = (angleName: string) => {
    const lowerName = angleName.toLowerCase();
    if (lowerName.includes('rake')) return new THREE.Color(ANGLE_COLORS.RAKE);
    if (lowerName.includes('relief')) return new THREE.Color(ANGLE_COLORS.RELIEF);
    if (lowerName.includes('clearance') || lowerName.includes('lip')) return new THREE.Color(ANGLE_COLORS.CUTTING_EDGE); // Group clearance and lip with cutting edge color
    return new THREE.Color(ANGLE_COLORS.DEFAULT);
};

// Simplified angle definitions for a generic tool model based on new angle types
const angleDefinitions: { [key: string]: any } = {
    'Rake Angle': { axis: 'x', origin: [0, 5, -10], plane: 'zy' }, // Representative rake position
    'Relief Angle': { axis: 'z', origin: [0, -5, 5], plane: 'xy' }, // Representative relief position
    'Clearance Angle': { axis: 'y', origin: [5, 0, 0], plane: 'xz' }, // Example for clearance, often near side relief
    'Lip Angle': { axis: 'x', origin: [0, 0, 0], plane: 'zy' }, // Example for lip angle, at the cutting edge
};


const createTextSprite = (text: string, color: THREE.Color, isHighlighted: boolean) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const fontSize = 48;
    context.font = `bold ${fontSize}px sans-serif`;
    const textMetrics = context.measureText(text);
    canvas.width = textMetrics.width + 20;
    canvas.height = fontSize + 20;

    context.fillStyle = isHighlighted ? color.getStyle() : 'rgba(0,0,0,0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = `bold ${fontSize}px sans-serif`;
    context.fillStyle = isHighlighted ? '#000000' : '#FFFFFF';
    context.fillText(text, 10, fontSize + 5);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 10, canvas.height / 10, 1.0);
    return sprite;
}

interface ThreeDViewProps {
  results: AnalysisResult[];
  highlightedAngle: string | null;
  modelUrl: string | null; // New prop for uploaded 3D model URL
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ results, highlightedAngle, modelUrl }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [loading3D, setLoading3D] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Set background to transparent
    renderer.setSize(mountRef.current.clientWidth, 400); // Set initial size
    mountRef.current.appendChild(renderer.domElement);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / 400, 0.1, 1000);
    camera.position.set(50, 40, 50);
    camera.lookAt(0, 0, 0);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(20, 30, 10);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight2.position.set(-20, -30, -10);
    scene.add(directionalLight2);


    const toolGroup = new THREE.Group();
    scene.add(toolGroup);

    const annotationsGroup = new THREE.Group();
    scene.add(annotationsGroup);
    
    // Function to create the generic tool model
    const createGenericTool = () => {
        // Clear existing tool parts before creating generic tool
        while(toolGroup.children.length > 0) {
            toolGroup.remove(toolGroup.children[0]);
        }
        const toolMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.8, roughness: 0.4 });
        const shank = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 60), toolMaterial);
        shank.position.z = -20;
        const tip = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), toolMaterial);
        tip.position.set(-2, 0, 10);
        const cuttingFace = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 10), toolMaterial);
        cuttingFace.position.set(2, 4, 10);
        cuttingFace.rotation.x = -Math.PI / 12; // Generic angle
        toolGroup.add(shank, tip, cuttingFace);
        toolGroup.rotation.y = -Math.PI / 4;
        
        // Reset camera for generic tool
        camera.position.set(50, 40, 50);
        camera.lookAt(0, 0, 0);
        controls.target.set(0,0,0);
        controls.update();
    };

    const updateAnnotations = () => {
        // Clear previous annotations
        while(annotationsGroup.children.length > 0) {
            annotationsGroup.remove(annotationsGroup.children[0]);
        }

        // Only add annotations if no custom model is loaded
        if (modelUrl) return;

        results.forEach(result => {
            const definition = angleDefinitions[result.angleName];
            if(!definition) return;

            const isHighlighted = result.angleName === highlightedAngle;
            const color = getAngleColor(result.angleName);

            const material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: isHighlighted ? 4 : 2,
                opacity: isHighlighted ? 1.0 : 0.7,
                transparent: true,
            });
            
            const origin = new THREE.Vector3(...definition.origin);
            const radius = 8;
            const angleRad = THREE.MathUtils.degToRad(result.measuredValue);
            
            // Draw Angle Arc
            const curve = new THREE.EllipseCurve(0,0, radius, radius, 0, angleRad, false, 0);
            const points = curve.getPoints(50);
            const arcGeom = new THREE.BufferGeometry().setFromPoints(points);
            const angleArc = new THREE.Line(arcGeom, material);
            
            // Draw Arms
            const arm1Geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(radius + 2, 0, 0)]);
            const arm1 = new THREE.Line(arm1Geom, material);
            const arm2 = arm1.clone();
            arm2.rotation.z = angleRad;

            const angleViz = new THREE.Group();
            angleViz.add(angleArc, arm1, arm2);

            // Position and orient the visualization
            if (definition.plane === 'xy') angleViz.quaternion.setFromEuler(new THREE.Euler(0, 0, 0));
            if (definition.plane === 'zy') angleViz.quaternion.setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
            if (definition.plane === 'xz') angleViz.quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
            angleViz.position.copy(origin);
            
            if (!isHighlighted && highlightedAngle) {
                material.opacity = 0.2;
            }

            // Text Label
            const textSprite = createTextSprite(`${result.measuredValue.toFixed(1)}°`, color, isHighlighted);
            const labelPos = new THREE.Vector3(radius + 5, 0, 0).applyAxisAngle(new THREE.Vector3(0,0,1), angleRad / 2);
            textSprite.position.copy(labelPos);
            angleViz.add(textSprite);

            annotationsGroup.add(angleViz);
        });
        // Sync annotation group rotation with the generic tool if it exists
        if (toolGroup.children.length > 0) {
          annotationsGroup.rotation.copy(toolGroup.rotation);
        }
    };

    const load3DModel = async (url: string) => {
      setLoading3D(true);
      setLoadError(null);
      // Clear existing tool parts and annotations
      while(toolGroup.children.length > 0) {
        toolGroup.remove(toolGroup.children[0]);
      }
      while(annotationsGroup.children.length > 0) {
        annotationsGroup.remove(annotationsGroup.children[0]);
      }

      const fileExtension = url.split('.').pop()?.toLowerCase();
      let loader: OBJLoader | STLLoader | null = null;

      if (fileExtension === 'obj') {
        loader = new OBJLoader();
      } else if (fileExtension === 'stl') {
        loader = new STLLoader();
      } else {
        setLoadError(`Unsupported 3D model format: ${fileExtension}. Only .obj and .stl are supported.`);
        setLoading3D(false);
        return;
      }

      try {
        if (loader instanceof OBJLoader) {
            const object = await loader.loadAsync(url);
            object.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.8, roughness: 0.4 });
                }
            });
            toolGroup.add(object);
        } else if (loader instanceof STLLoader) {
            const geometry = await loader.loadAsync(url);
            // Compute bounding box for STL for centering
            geometry.computeBoundingBox();
            const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
            geometry.translate(-center.x, -center.y, -center.z); // Center the geometry

            const material = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.8, roughness: 0.4 });
            const mesh = new THREE.Mesh(geometry, material);
            toolGroup.add(mesh);
        }

        // Fit camera to loaded model
        const box = new THREE.Box3().setFromObject(toolGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Add some padding
        
        camera.position.set(center.x, center.y, center.z + cameraZ);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
        
      } catch (e) {
        console.error("Error loading 3D model:", e);
        setLoadError(`Failed to load 3D model: ${(e as Error).message}.`);
      } finally {
        setLoading3D(false);
      }
    };

    if (modelUrl) {
      load3DModel(modelUrl);
    } else {
      createGenericTool();
      updateAnnotations(); // Add annotations for generic tool
    }

    // Resize handler
    const handleResize = () => {
        if (!mountRef.current) return;
        const width = mountRef.current.clientWidth;
        const height = 400; // Fixed height
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
        resizeObserver.disconnect();
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
    };
  }, [results, highlightedAngle, modelUrl, theme]); // Rerun effect if results, highlightedAngle, modelUrl, or theme change


  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 relative">
      {loading3D && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/70 dark:bg-zinc-900/70 z-10">
          <div className="flex flex-col items-center text-zinc-700 dark:text-zinc-300">
            <Spinner />
            <p className="mt-2">Loading 3D Model...</p>
          </div>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/70 dark:bg-red-900/70 z-10 p-4 text-center text-red-700 dark:text-red-300">
          <p>{loadError}</p>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};