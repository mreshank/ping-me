/**
 * Ping-Me - Keep your free tier backends alive
 * 
 * This is the main entry point for the ping-me package.
 * It exports the core functionality and detects which frameworks are available.
 */

// Re-export everything from core
export * from '@ping-me/core';

/**
 * Framework detection flags - these will be true if the relevant framework
 * is detected in the user's environment
 */
export const frameworks = {
  express: detectFramework('express'),
  next: detectFramework('next'),
  fastify: detectFramework('fastify'),
  koa: detectFramework('koa'),
  hono: detectFramework('hono')
};

/**
 * Initialize ping-me with auto-detection of frameworks
 */
export function initialize(options: any = {}) {
  // Try to auto-detect the framework
  if (frameworks.express) {
    try {
      const express = require('@ping-me/express');
      return {
        framework: 'express',
        adapter: express,
        withPingMe: express.withPingMe
      };
    } catch (error) {
      console.warn('[ping-me] Express detected but @ping-me/express is not installed.');
    }
  }

  if (frameworks.next) {
    try {
      const next = require('@ping-me/next');
      return {
        framework: 'next',
        adapter: next,
        withPingMe: next.withPingMeNext,
        createPingMeHandler: next.createPingMeHandler,
        usePingMe: next.usePingMe
      };
    } catch (error) {
      console.warn('[ping-me] Next.js detected but @ping-me/next is not installed.');
    }
  }

  if (frameworks.fastify) {
    try {
      const fastify = require('@ping-me/fastify');
      return {
        framework: 'fastify',
        adapter: fastify,
        withPingMe: fastify.withPingMe
      };
    } catch (error) {
      console.warn('[ping-me] Fastify detected but @ping-me/fastify is not installed.');
    }
  }

  if (frameworks.koa) {
    try {
      const koa = require('@ping-me/koa');
      return {
        framework: 'koa',
        adapter: koa,
        withPingMe: koa.withPingMe
      };
    } catch (error) {
      console.warn('[ping-me] Koa detected but @ping-me/koa is not installed.');
    }
  }

  if (frameworks.hono) {
    try {
      const hono = require('@ping-me/hono');
      return {
        framework: 'hono',
        adapter: hono,
        withPingMe: hono.withPingMe
      };
    } catch (error) {
      console.warn('[ping-me] Hono detected but @ping-me/hono is not installed.');
    }
  }

  // Fallback to core functionality
  const core = require('@ping-me/core');
  return {
    framework: 'none',
    adapter: core,
    pingMe: core.pingMe,
    createPingEndpoint: core.createPingEndpoint
  };
}

/**
 * Auto-initialization - returns the appropriate functions based on detected framework
 */
export default initialize();

/**
 * Helper to detect if a framework is present in the environment
 */
function detectFramework(name: string): boolean {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
} 