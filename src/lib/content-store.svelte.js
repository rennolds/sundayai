// src/lib/content-store.svelte.js
import { generateContent } from './ai-service.js';

export const contentState = $state({
  results: {},
  isGenerating: false,
  error: null
});

/**
 * Generate AI content based on transcript and selected options
 * @param {string} transcript - The sermon transcript
 * @param {Object} options - The selected options for content generation
 * @returns {Promise<Object>} - The generated content
 */
export async function generateAIContent(transcript, options) {
  contentState.isGenerating = true;
  contentState.error = null;
  
  try {
    const results = await generateContent(transcript, options);
    contentState.results = results;
    return results;
  } catch (error) {
    contentState.error = error.message;
    throw error;
  } finally {
    contentState.isGenerating = false;
  }
}

/**
 * Reset the content state
 */
export function resetContent() {
  contentState.results = {};
  contentState.isGenerating = false;
  contentState.error = null;
}

/**
 * Get the current content state
 */
export function getContentState() {
  return contentState;
}