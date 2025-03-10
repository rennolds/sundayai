// src/lib/content-store.svelte.js
import { generateContent } from './ai-service.js';

export const contentState = $state({
  results: {},
  isGenerating: false,
  error: null,
  pendingItems: [] // Track which items are still being generated
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
  contentState.results = {}; // Clear previous results
  
  // Set up the initial pending items list
  const pendingItems = [];
  if (options.sermonPrep.critique) pendingItems.push('critique');
  if (options.sermonPrep.perspectiveFeedback) pendingItems.push('perspectiveFeedback');
  if (options.sundayContent.bibleStudyGuide) pendingItems.push('bibleStudyGuide');
  if (options.sundayContent.kidsFollowAlong) pendingItems.push('kidsFollowAlong');
  
  contentState.pendingItems = pendingItems;
  
  try {
    // Call the updated generateContent function that now processes items sequentially
    const results = await generateContent(transcript, options);
    
    // When all items are complete, clear the pending items
    contentState.pendingItems = [];
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
 * Update a single result as it becomes available
 * @param {string} type - The type of content
 * @param {string} content - The generated content
 */
export function updateContentResult(type, content) {
  contentState.results = { ...contentState.results, [type]: content };
  
  // Remove this item from the pending items list
  contentState.pendingItems = contentState.pendingItems.filter(item => item !== type);
}

/**
 * Reset the content state
 */
export function resetContent() {
  contentState.results = {};
  contentState.isGenerating = false;
  contentState.error = null;
  contentState.pendingItems = [];
}

/**
 * Get the current content state
 */
export function getContentState() {
  return contentState;
}