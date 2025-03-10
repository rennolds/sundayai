// src/lib/whisper-service.js
import OpenAI from 'openai';

/**
 * Transcribe audio file using OpenAI's Whisper API
 * @param {File} audioFile - The audio file to transcribe
 * @returns {Promise<string>} - The transcribed text
 */
export async function transcribeAudio(audioFile) {
  try {
    // Check file size - Whisper API has a 25MB limit
    if (audioFile.size > 25 * 1024 * 1024) {
      throw new Error('Audio file exceeds the 25MB size limit for transcription');
    }

    // Initialize OpenAI client with API key from environment variable
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Needed for client-side usage
    });

    // Call the OpenAI API
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en" // Specify English language
    });

    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}