// src/lib/transcript-store.svelte.js
import { transcribeAudio } from './whisper-service.js';

export const transcriptState = $state({
  rawText: '',
  processedText: '',
  isLoading: false,
  error: null
});

/**
 * Extract text from an uploaded file
 * @param {File} file - The uploaded file
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromFile(file) {
  transcriptState.isLoading = true;
  transcriptState.error = null;
  
  try {
    // For text files
    if (file.type === 'text/plain') {
      const text = await readTextFile(file);
      transcriptState.rawText = text;
      return text;
    }
    
    // For PDF files
    else if (file.type === 'application/pdf') {
      // In a real app, you'd use a PDF parsing library
      // This is a placeholder - you'd need to implement actual PDF parsing
      const text = await simulatePdfExtraction(file);
      transcriptState.rawText = text;
      return text;
    }
    
    // For DOC/DOCX files
    else if (
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // In a real app, you'd use a DOCX parsing library
      // This is a placeholder - you'd need to implement actual DOCX parsing
      const text = await simulateDocExtraction(file);
      transcriptState.rawText = text;
      return text;
    }
    
    // For audio files - use OpenAI Whisper API
    else if (file.type.startsWith('audio/')) {
      const text = await transcribeAudio(file);
      transcriptState.rawText = text;
      return text;
    }
    
    else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    transcriptState.error = error.message;
    throw error;
  } finally {
    transcriptState.isLoading = false;
  }
}

/**
 * Process the extracted text (placeholder for future NLP/AI processing)
 * @param {string} text - The raw text to process
 */
export function processTranscript(text) {
  // In a real app, this might involve NLP or AI processing
  // For now, we'll just store the raw text
  transcriptState.processedText = text;
  return text;
}

/**
 * Get the current transcript state
 */
export function getTranscriptState() {
  return transcriptState;
}

/**
 * Reset the transcript state
 */
export function resetTranscript() {
  transcriptState.rawText = '';
  transcriptState.processedText = '';
  transcriptState.isLoading = false;
  transcriptState.error = null;
}

// Helper functions

/**
 * Read a text file and return its contents
 * @param {File} file - The text file to read
 * @returns {Promise<string>} - The file contents
 */
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Simulate PDF text extraction (placeholder)
 * @param {File} file - The PDF file
 * @returns {Promise<string>} - Extracted text
 */
function simulatePdfExtraction(file) {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      resolve(`Simulated PDF extraction from ${file.name}\n\nThis is placeholder text. In a real implementation, you would use a PDF parsing library to extract the actual content of the document.`);
    }, 1500);
  });
}

/**
 * Simulate DOC/DOCX text extraction (placeholder)
 * @param {File} file - The DOC/DOCX file
 * @returns {Promise<string>} - Extracted text
 */
function simulateDocExtraction(file) {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      resolve(`Simulated DOC/DOCX extraction from ${file.name}\n\nThis is placeholder text. In a real implementation, you would use a document parsing library to extract the actual content of the document.`);
    }, 1500);
  });
}