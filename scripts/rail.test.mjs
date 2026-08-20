#!/usr/bin/env node
/** Scroll->rail mapping. Runnable check for the only real logic on the page. */
import assert from 'node:assert/strict'
import { railFrom } from '../src/useScrollRail.js'

const V = 800, N = 10, H = N * V // ten screens tall

// Top of the section: hero fully visible, first device centred.
assert.equal(railFrom(0, H, V, N).railPos, 0)
assert.equal(railFrom(0, H, V, N).engage, 0)

// One screen down: hero fully handed over to the work panel.
assert.equal(railFrom(-V, H, V, N).engage, 1)

// Bottom of the travel: last device centred, never beyond.
assert.equal(railFrom(-(H - V), H, V, N).railPos, N - 1)

// Overscroll in both directions must clamp, not run off the rail.
assert.equal(railFrom(500, H, V, N).railPos, 0)
assert.equal(railFrom(-99999, H, V, N).railPos, N - 1)
assert.equal(railFrom(-99999, H, V, N).engage, 1)

// Halfway is halfway.
assert.equal(railFrom(-(H - V) / 2, H, V, N).railPos, (N - 1) / 2)

// Degenerate cases must not divide by zero or produce NaN.
assert.deepEqual(railFrom(0, V, V, N), { railPos: 0, engage: 0 })   // no travel
assert.deepEqual(railFrom(-100, H, V, 1), { railPos: 0, engage: 0 }) // single slot
assert.ok(Number.isFinite(railFrom(-100, H, V, N).railPos))

console.log('✓ rail mapping: 10 assertions passed')
