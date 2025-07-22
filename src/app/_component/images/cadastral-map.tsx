"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const BuildingPermit3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountNode = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87ceeb, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(600, 500);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x87ceeb, 0.3);
    rendererRef.current = renderer;
    mountNode.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(20, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Ground with topographical elevation
    const groundGeometry = new THREE.PlaneGeometry(30, 30, 32, 32);
    const vertices = groundGeometry.attributes.position;

    // Add subtle topographical variations
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const z = vertices.getZ(i);
      const elevation = Math.sin(x * 0.1) * 0.3 + Math.cos(z * 0.1) * 0.2;
      vertices.setZ(i, elevation);
    }
    vertices.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create utility functions for 3D text
    const createTextGeometry = (text, size = 0.5) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 256;
      canvas.height = 64;
      if (context) {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "black";
        context.font = "bold 24px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, canvas.width / 2, canvas.height / 2);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      const geometry = new THREE.PlaneGeometry(size * 4, size);

      return { geometry, material };
    };

    // Create cadastral plots with setbacks
    const plots = [
      {
        x: -6,
        z: -6,
        width: 5,
        height: 5,
        color: 0x3b82f6,
        label: "Plot A-001",
        setback: 1.5,
      },
      {
        x: 2,
        z: -6,
        width: 5,
        height: 5,
        color: 0x8b5cf6,
        label: "Plot A-002",
        setback: 1.5,
      },
      {
        x: -6,
        z: 2,
        width: 5,
        height: 5,
        color: 0x059669,
        label: "Plot B-001",
        setback: 1.5,
      },
      {
        x: 2,
        z: 2,
        width: 5,
        height: 5,
        color: 0xdc2626,
        label: "Plot B-002",
        setback: 1.5,
      },
    ];

    plots.forEach((plot, index) => {
      // Plot base
      const plotGeometry = new THREE.BoxGeometry(plot.width, 0.2, plot.height);
      const plotMaterial = new THREE.MeshLambertMaterial({
        color: plot.color,
        transparent: true,
        opacity: 0.7,
      });
      const plotMesh = new THREE.Mesh(plotGeometry, plotMaterial);
      plotMesh.position.set(
        plot.x + plot.width / 2,
        0.1,
        plot.z + plot.height / 2,
      );
      plotMesh.castShadow = true;
      plotMesh.receiveShadow = true;
      scene.add(plotMesh);

      // Plot boundaries (wireframe)
      const edges = new THREE.EdgesGeometry(plotGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 3,
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      wireframe.position.copy(plotMesh.position);
      wireframe.position.y += 0.01;
      scene.add(wireframe);

      // SETBACK LINES - Visual boundaries showing required distances
      const setbackWidth = plot.width - 2 * plot.setback;
      const setbackHeight = plot.height - 2 * plot.setback;
      const setbackGeometry = new THREE.BoxGeometry(
        setbackWidth,
        0.05,
        setbackHeight,
      );
      const setbackMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      const setbackMesh = new THREE.Mesh(setbackGeometry, setbackMaterial);
      setbackMesh.position.set(
        plot.x + plot.width / 2,
        0.3,
        plot.z + plot.height / 2,
      );
      scene.add(setbackMesh);

      // Setback line markers (red lines)
      const setbackEdges = new THREE.EdgesGeometry(setbackGeometry);
      const setbackLineMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,
        linewidth: 2,
      });
      const setbackWireframe = new THREE.LineSegments(
        setbackEdges,
        setbackLineMaterial,
      );
      setbackWireframe.position.copy(setbackMesh.position);
      scene.add(setbackWireframe);

      // DIMENSIONAL ANNOTATIONS
      const { geometry: dimGeom, material: dimMat } = createTextGeometry(
        `${plot.width}m x ${plot.height}m`,
        0.3,
      );
      const dimensionLabel = new THREE.Mesh(dimGeom, dimMat);
      dimensionLabel.position.set(plot.x + plot.width / 2, 0.5, plot.z - 0.5);
      dimensionLabel.lookAt(camera.position);
      scene.add(dimensionLabel);

      // Plot label
      const { geometry: labelGeom, material: labelMat } = createTextGeometry(
        plot.label,
        0.2,
      );
      const plotLabel = new THREE.Mesh(labelGeom, labelMat);
      plotLabel.position.set(
        plot.x + plot.width / 2,
        0.4,
        plot.z + plot.height / 2,
      );
      plotLabel.lookAt(camera.position);
      scene.add(plotLabel);

      // ZONING COMPLIANCE OVERLAY - Allowable building areas
      if (setbackWidth > 0 && setbackHeight > 0) {
        const allowableGeometry = new THREE.PlaneGeometry(
          setbackWidth,
          setbackHeight,
        );
        const allowableMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.2,
        });
        const allowableArea = new THREE.Mesh(
          allowableGeometry,
          allowableMaterial,
        );
        allowableArea.position.set(
          plot.x + plot.width / 2,
          0.25,
          plot.z + plot.height / 2,
        );
        allowableArea.rotation.x = -Math.PI / 2;
        scene.add(allowableArea);
      }

      // Add buildings on some plots with HEIGHT RESTRICTION INDICATORS
      if (index === 1 || index === 3) {
        const maxHeight = 8; // Maximum allowed height
        const buildingHeight = Math.random() * 3 + 2;
        const buildingGeometry = new THREE.BoxGeometry(2, buildingHeight, 2);
        const buildingMaterial = new THREE.MeshLambertMaterial({
          color: index === 1 ? 0xf59e0b : 0xef4444,
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(
          plot.x + plot.width / 2,
          buildingHeight / 2 + 0.2,
          plot.z + plot.height / 2,
        );
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);

        // Height restriction indicator (invisible box showing max height)
        const heightLimitGeometry = new THREE.BoxGeometry(2.2, maxHeight, 2.2);
        const heightLimitMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.1,
          wireframe: true,
        });
        const heightLimitBox = new THREE.Mesh(
          heightLimitGeometry,
          heightLimitMaterial,
        );
        heightLimitBox.position.set(
          plot.x + plot.width / 2,
          maxHeight / 2 + 0.2,
          plot.z + plot.height / 2,
        );
        scene.add(heightLimitBox);

        // Height label
        const { geometry: heightGeom, material: heightMat } =
          createTextGeometry(
            `${buildingHeight.toFixed(1)}m / ${maxHeight}m max`,
            0.2,
          );
        const heightLabel = new THREE.Mesh(heightGeom, heightMat);
        heightLabel.position.set(
          plot.x + plot.width / 2 + 2,
          buildingHeight + 1,
          plot.z + plot.height / 2,
        );
        heightLabel.lookAt(camera.position);
        scene.add(heightLabel);

        // Building roof
        const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(
          plot.x + plot.width / 2,
          buildingHeight + 0.7,
          plot.z + plot.height / 2,
        );
        roof.castShadow = true;
        scene.add(roof);
      }
    });

    // Roads
    const roadGeometry = new THREE.PlaneGeometry(30, 1);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x4a5568 });

    // Horizontal road
    const roadH = new THREE.Mesh(roadGeometry, roadMaterial);
    roadH.rotation.x = -Math.PI / 2;
    roadH.position.y = 0.05;
    roadH.receiveShadow = true;
    scene.add(roadH);

    // Vertical road
    const roadV = new THREE.Mesh(roadGeometry, roadMaterial);
    roadV.rotation.x = -Math.PI / 2;
    roadV.rotation.z = Math.PI / 2;
    roadV.position.y = 0.05;
    roadV.receiveShadow = true;
    scene.add(roadV);

    // UTILITY EASEMENTS
    const easementPositions = [
      { start: { x: -15, z: -1 }, end: { x: 15, z: -1 }, type: "Electric" },
      { start: { x: -15, z: 1 }, end: { x: 15, z: 1 }, type: "Water" },
      { start: { x: -1, z: -15 }, end: { x: -1, z: 15 }, type: "Gas" },
      { start: { x: 1, z: -15 }, end: { x: 1, z: 15 }, type: "Sewer" },
    ];

    easementPositions.forEach((easement, index) => {
      const length = Math.sqrt(
        Math.pow(easement.end.x - easement.start.x, 2) +
          Math.pow(easement.end.z - easement.start.z, 2),
      );

      const easementGeometry = new THREE.CylinderGeometry(0.1, 0.1, length);
      const easementColors = [0xff6b35, 0x3b82f6, 0xfcd34d, 0x8b4513];
      const easementMaterial = new THREE.MeshBasicMaterial({
        color: easementColors[index],
        transparent: true,
        opacity: 0.7,
      });

      const easementMesh = new THREE.Mesh(easementGeometry, easementMaterial);
      easementMesh.position.set(
        (easement.start.x + easement.end.x) / 2,
        -0.3,
        (easement.start.z + easement.end.z) / 2,
      );

      if (
        Math.abs(easement.end.x - easement.start.x) >
        Math.abs(easement.end.z - easement.start.z)
      ) {
        easementMesh.rotation.z = Math.PI / 2;
      }

      scene.add(easementMesh);

      // Utility labels
      const { geometry: utilGeom, material: utilMat } = createTextGeometry(
        easement.type,
        0.15,
      );
      const utilityLabel = new THREE.Mesh(utilGeom, utilMat);
      utilityLabel.position.set(
        (easement.start.x + easement.end.x) / 2,
        0.2,
        (easement.start.z + easement.end.z) / 2 + 0.5,
      );
      utilityLabel.lookAt(camera.position);
      scene.add(utilityLabel);
    });

    // DRAINAGE/TOPOGRAPHICAL INFORMATION
    // Add drainage arrows showing water flow direction
    const drainagePoints = [
      { x: -10, z: -10, direction: { x: 1, z: 1 } },
      { x: 10, z: -10, direction: { x: -1, z: 1 } },
      { x: -10, z: 10, direction: { x: 1, z: -1 } },
      { x: 10, z: 10, direction: { x: -1, z: -1 } },
    ];

    drainagePoints.forEach((point) => {
      const arrowGeometry = new THREE.ConeGeometry(0.3, 1, 8);
      const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

      arrow.position.set(point.x, 0.5, point.z);
      arrow.lookAt(
        point.x + point.direction.x,
        0.5,
        point.z + point.direction.z,
      );
      arrow.rotateX(-Math.PI / 2);

      scene.add(arrow);

      // Drainage flow lines
      const flowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3);
      const flowMaterial = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.6,
      });
      const flowLine = new THREE.Mesh(flowGeometry, flowMaterial);
      flowLine.position.set(
        point.x + point.direction.x * 1.5,
        0.1,
        point.z + point.direction.z * 1.5,
      );

      const angle = Math.atan2(point.direction.x, point.direction.z);
      flowLine.rotation.z = angle;

      scene.add(flowLine);
    });

    // Trees and landmarks
    const treePositions = [
      { x: -10, z: -10 },
      { x: 10, z: -10 },
      { x: -10, z: 10 },
      { x: 10, z: 10 },
      { x: -8, z: 0 },
      { x: 8, z: 0 },
      { x: 0, z: -8 },
      { x: 0, z: 8 },
    ];

    treePositions.forEach((pos) => {
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(pos.x, 1, pos.z);
      trunk.castShadow = true;
      scene.add(trunk);

      // Tree foliage
      const foliageGeometry = new THREE.SphereGeometry(1.2);
      const foliageMaterial = new THREE.MeshLambertMaterial({
        color: 0x228b22,
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(pos.x, 2.5, pos.z);
      foliage.castShadow = true;
      scene.add(foliage);
    });

    // Survey markers/GPS points
    const markerGeometry = new THREE.ConeGeometry(0.2, 1, 8);
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xff6b35 });

    const markerPositions = [
      { x: -12, z: -12 },
      { x: 12, z: -12 },
      { x: -12, z: 12 },
      { x: 12, z: 12 },
    ];

    markerPositions.forEach((pos) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(pos.x, 0.5, pos.z);
      marker.castShadow = true;
      scene.add(marker);
    });

    // NORTH ARROW AND SCALE REFERENCE
    // North arrow
    const northArrowGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const northArrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const northArrow = new THREE.Mesh(northArrowGeometry, northArrowMaterial);
    northArrow.position.set(12, 1, 12);
    northArrow.rotateX(-Math.PI / 2);
    scene.add(northArrow);

    // North label
    const { geometry: northGeom, material: northMat } = createTextGeometry(
      "N",
      0.3,
    );
    const northLabel = new THREE.Mesh(northGeom, northMat);
    northLabel.position.set(12, 2.5, 12);
    northLabel.lookAt(camera.position);
    scene.add(northLabel);

    // Scale reference
    const scaleGeometry = new THREE.BoxGeometry(5, 0.1, 0.2);
    const scaleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const scaleBar = new THREE.Mesh(scaleGeometry, scaleMaterial);
    scaleBar.position.set(-12, 0.2, 12);
    scene.add(scaleBar);

    // Scale markers
    for (let i = 0; i <= 5; i++) {
      const tickGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
      const tick = new THREE.Mesh(tickGeometry, scaleMaterial);
      tick.position.set(-12 - 2.5 + i, 0.35, 12);
      scene.add(tick);

      if (i % 1 === 0) {
        const { geometry: tickGeom, material: tickMat } = createTextGeometry(
          `${i}m`,
          0.1,
        );
        const tickLabel = new THREE.Mesh(tickGeom, tickMat);
        tickLabel.position.set(-12 - 2.5 + i, 0.6, 12);
        tickLabel.lookAt(camera.position);
        scene.add(tickLabel);
      }
    }

    // Legend/Information Panel
    const legendItems = [
      "Red Lines: Setback Boundaries",
      "Green Areas: Buildable Zones",
      "Yellow Boxes: Height Limits",
      "Blue Lines: Water/Drainage",
      "Colored Tubes: Utility Lines",
    ];

    legendItems.forEach((item, index) => {
      const { geometry: legendGeom, material: legendMat } = createTextGeometry(
        item,
        0.15,
      );
      const legendLabel = new THREE.Mesh(legendGeom, legendMat);
      legendLabel.position.set(-14, 8 - index * 0.8, -12);
      legendLabel.lookAt(camera.position);
      scene.add(legendLabel);
    });

    // Animation loop
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Gentle camera rotation
      camera.position.x = Math.cos(time * 0.2) * 15;
      camera.position.z = Math.sin(time * 0.2) * 15;
      camera.lookAt(0, 0, 0);

      // Update label orientations to face camera
      scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material &&
          ((child.material instanceof THREE.MeshBasicMaterial &&
            child.material.map &&
            child.material.map.image) ||
            (child.material instanceof THREE.MeshLambertMaterial &&
              child.material.map &&
              child.material.map.image))
        ) {
          child.lookAt(camera.position);
        }
      });

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={mountRef}
        className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20 shadow-2xl"
        style={{ minHeight: "400px" }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg">
              Loading Building Permit Visualization...
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Color Legend
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700">
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-red-500 mr-3 shadow-sm"></span>
            Setback Lines
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-green-500 mr-3 shadow-sm"></span>
            Buildable Areas
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-yellow-400 mr-3 shadow-sm"></span>
            Height Limits
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-blue-500 mr-3 shadow-sm"></span>
            Water / Drainage
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-orange-500 mr-3 shadow-sm"></span>
            Electric Lines
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-amber-600 mr-3 shadow-sm"></span>
            Gas Lines
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingPermit3D;
