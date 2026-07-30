'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

/**
 * A rotating cloud of the skills employers are actually asking for.
 *
 * Replaces the old app's TagCanvas dependency — a jQuery plugin fed a hard-coded word list. This is
 * ~150 lines with no dependencies, driven by live advertisement data, and clicking a word filters the
 * job board by it.
 *
 * Three things here are not decoration:
 *
 *   **Nothing in this canvas is reachable by a keyboard or a screen reader**, and canvas pixels cannot
 *   be asserted on in a test. The parent renders a real `<Link>` list next to it; that list is the
 *   accessible control, the no-JS fallback and the thing Playwright clicks. This component is marked
 *   `aria-hidden` so the same skills are not announced twice.
 *
 *   **`prefers-reduced-motion` stops the animation entirely** rather than slowing it. A rotating word
 *   cloud is exactly the kind of continuous motion that setting exists to turn off; one static frame
 *   is drawn instead.
 *
 *   **The canvas is sized in device pixels** and scaled back with CSS. Skipping that renders text at
 *   1x on a 2x display, which looks blurred in a way that is hard to attribute afterwards.
 */

type Point = { x: number; y: number; z: number };

const RADIUS_RATIO = 0.42;
const ROTATION_SPEED = 0.00022;

export function SkillSphereCanvas({ skills }: { skills: readonly string[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const [hovered, setHovered] = useState<number | null>(null);

  // Written by the render loop and read by the pointer handlers. A ref, not state: this changes on
  // every frame and re-rendering React 60 times a second to move a word is not the job.
  const projected = useRef<{ x: number; y: number; width: number; height: number }[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const hoveredIndex = useRef<number | null>(null);

  const hitTest = useCallback((x: number, y: number) => {
    for (let index = projected.current.length - 1; index >= 0; index -= 1) {
      const box = projected.current[index];
      if (!box) continue;

      if (
        x >= box.x - box.width / 2 &&
        x <= box.x + box.width / 2 &&
        y >= box.y - box.height / 2 &&
        y <= box.y + box.height / 2
      ) {
        return index;
      }
    }

    return null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || skills.length === 0) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const points = fibonacciSphere(skills.length);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let start = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      // Reset before scaling, or every resize compounds the previous transform.
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (elapsed: number) => {
      const angle = reduceMotion ? 0.6 : elapsed * ROTATION_SPEED;
      const radius = Math.min(width, height) * RADIUS_RATIO;
      const centreX = width / 2;
      const centreY = height / 2;

      context.clearRect(0, 0, width, height);
      projected.current = [];

      // Painter's algorithm: sort back to front so the words nearer the viewer overlap the ones
      // behind them rather than the other way round.
      const rotated = points
        .map((point, index) => ({ index, ...rotate(point, angle) }))
        .sort((a, b) => a.z - b.z);

      for (const { index, x, y, z } of rotated) {
        const label = skills[index];
        if (!label) continue;

        // z runs -1..1. Nearer words are larger and more opaque; the far side stays legible enough to
        // read as part of a sphere rather than disappearing.
        const depth = (z + 1) / 2;
        const scale = 0.55 + depth * 0.65;
        const fontSize = 13 * scale;

        context.font = `${index === hoveredIndex.current ? 700 : 500} ${fontSize}px ${
          theme.typography.fontFamily ?? 'sans-serif'
        }`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.globalAlpha = 0.35 + depth * 0.65;
        context.fillStyle =
          index === hoveredIndex.current
            ? theme.palette.secondary.main
            : theme.palette.primary.main;

        const screenX = centreX + x * radius;
        const screenY = centreY + y * radius;

        context.fillText(label, screenX, screenY);

        projected.current[index] = {
          x: screenX,
          y: screenY,
          width: context.measureText(label).width + 8,
          height: fontSize + 8,
        };
      }

      context.globalAlpha = 1;

      // Hit testing happens after the frame is laid out, so hover always matches what is on screen.
      if (pointer.current) {
        const next = hitTest(pointer.current.x, pointer.current.y);

        if (next !== hoveredIndex.current) {
          hoveredIndex.current = next;
          setHovered(next);
        }
      }
    };

    const loop = (timestamp: number) => {
      if (!start) start = timestamp;
      draw(timestamp - start);
      frame = requestAnimationFrame(loop);
    };

    resize();

    if (reduceMotion) {
      draw(0);
    } else {
      frame = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(0);
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [hitTest, skills, theme]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      // The `<Link>` list beside this is the accessible control; announcing the same skills twice
      // would just make the page longer to listen to.
      aria-hidden
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      }}
      onPointerLeave={() => {
        pointer.current = null;
        hoveredIndex.current = null;
        setHovered(null);
      }}
      onClick={() => {
        const index = hoveredIndex.current;
        const skill = index === null ? undefined : skills[index];
        if (skill) router.push(`/jobs?skill=${encodeURIComponent(skill)}`);
      }}
      sx={{
        display: 'block',
        width: '100%',
        height: { xs: 320, md: 420 },
        cursor: hovered === null ? 'default' : 'pointer',
        touchAction: 'none',
      }}
    />
  );
}

/**
 * Spreads N points evenly over a sphere.
 *
 * The golden-angle spiral, not random placement and not a latitude/longitude grid — random leaves
 * visible clumps and gaps, and a grid crowds the poles. This is the standard construction and it is
 * three lines.
 */
function fibonacciSphere(count: number): Point[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  return Array.from({ length: count }, (_, index) => {
    const y = count === 1 ? 0 : 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * index;

    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
  });
}

/** Spins around Y and tilts slightly on X, so the sphere reads as a sphere rather than a ring. */
function rotate(point: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const x = point.x * cos - point.z * sin;
  const z = point.x * sin + point.z * cos;

  const tilt = 0.35;
  const y = point.y * Math.cos(tilt) - z * Math.sin(tilt);
  const depth = point.y * Math.sin(tilt) + z * Math.cos(tilt);

  return { x, y, z: depth };
}
