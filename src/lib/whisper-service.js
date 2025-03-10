// src/lib/whisper-service.js
import OpenAI from 'openai';

/**
 * Transcribe audio file using OpenAI's Whisper API
 * @param {File} audioFile - The audio file to transcribe
 * @returns {Promise<string>} - The transcribed text
 */
export async function transcribeAudio(audioFile) {
  try {
    // Initialize OpenAI client with API key from environment variable
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Needed for client-side usage
    });

    // Convert File to FormData for the API request
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en'); // Specify English language

    // Call the OpenAI API
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en"
    });

    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}