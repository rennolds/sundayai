// src/lib/ai-service.js
import OpenAI from 'openai';

/**
 * Generate content based on transcript and selected options
 * @param {string} transcript - The sermon transcript
 * @param {Object} options - The selected options for content generation
 * @returns {Promise<Object>} - The generated content
 */
export async function generateContent(transcript, options) {
  try {
    // Initialize OpenAI client with API key from environment variable
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Needed for client-side usage
    });

    const results = {};
    const model = "gpt-4o"; // Using GPT-4 for better quality
    
    // Create a queue of content generation tasks
    const tasks = [];
    
    // Sermon Prep options
    if (options.sermonPrep.critique) {
      tasks.push({
        type: 'critique',
        execute: () => generateSermonCritique(openai, model, transcript)
      });
    }
    
    if (options.sermonPrep.perspectiveFeedback) {
      tasks.push({
        type: 'perspectiveFeedback',
        execute: () => generatePerspectiveFeedback(openai, model, transcript)
      });
    }
    
    // Sunday Content options
    if (options.sundayContent.bibleStudyGuide) {
      tasks.push({
        type: 'bibleStudyGuide',
        execute: () => generateBibleStudyGuide(openai, model, transcript)
      });
    }
    
    if (options.sundayContent.kidsFollowAlong) {
      tasks.push({
        type: 'kidsFollowAlong',
        execute: () => generateKidsFollowAlong(openai, model, transcript)
      });
    }
    
            // Import the function to update content results as they become available
    const updateContentResult = window.updateContentResult;
    
    // Process tasks sequentially to avoid rate limits
    for (const task of tasks) {
      try {
        console.log(`Starting generation of ${task.type}...`);
        const result = await task.execute();
        results[task.type] = result;
        
        // If the updateContentResult function is available, update the UI as we go
        if (typeof updateContentResult === 'function') {
          updateContentResult(task.type, result);
        }
        
        console.log(`Completed generation of ${task.type}`);
        
        // Add a small delay between API calls to further reduce rate limit issues
        if (tasks.indexOf(task) < tasks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error generating ${task.type}:`, error);
        const errorMessage = `Error generating content: ${error.message}`;
        results[task.type] = errorMessage;
        
        // If the updateContentResult function is available, update the UI with the error
        if (typeof updateContentResult === 'function') {
          updateContentResult(task.type, errorMessage);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

/**
 * Generate sermon critique
 * @param {OpenAI} openai - OpenAI client instance
 * @param {string} model - Model to use for generation
 * @param {string} transcript - The sermon transcript
 * @returns {Promise<string>} - The generated critique
 */
async function generateSermonCritique(openai, model, transcript) {
  const prompt = `
    You are an expert in homiletics and sermon critique. Please provide a constructive critique of the following sermon transcript. Focus on:
    1. Clarity of the main message
    2. Biblical accuracy and depth
    3. Effective use of illustrations
    4. Delivery and engagement
    5. Practical application

    Format your response with clear sections and bullet points where appropriate.

    SERMON TRANSCRIPT:
    ${transcript}
  `;
  
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1500
  });
  
  return response.choices[0].message.content;
}

/**
 * Generate perspective feedback
 * @param {OpenAI} openai - OpenAI client instance
 * @param {string} model - Model to use for generation
 * @param {string} transcript - The sermon transcript
 * @returns {Promise<string>} - The generated feedback
 */
async function generatePerspectiveFeedback(openai, model, transcript) {
  const prompt = `
    You are a diverse panel of thoughtful listeners from different backgrounds, ages, and life experiences. Review the following sermon transcript and provide perspective feedback on:
    1. How the message might be received by different demographics
    2. Potential cultural blind spots or assumptions
    3. Accessibility of the content for newcomers vs. long-time church members
    4. Areas where different perspectives might enrich the message

    SERMON TRANSCRIPT:
    ${transcript}
  `;
  
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1500
  });
  
  return response.choices[0].message.content;
}

/**
 * Generate Bible study guide
 * @param {OpenAI} openai - OpenAI client instance
 * @param {string} model - Model to use for generation
 * @param {string} transcript - The sermon transcript
 * @returns {Promise<string>} - The generated study guide
 */
async function generateBibleStudyGuide(openai, model, transcript) {
  const prompt = `
    Based on the following sermon transcript, create a comprehensive Bible Study Leader's Guide with:
    1. Key Scripture passages from the sermon
    2. 5-7 discussion questions that progress from observation to application
    3. Context and background information for the leader
    4. Potential challenges and how to address them
    5. Prayer points related to the sermon topic

    Format this as a ready-to-use leader's guide with clear sections.

    SERMON TRANSCRIPT:
    ${transcript}
  `;
  
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1500
  });
  
  return response.choices[0].message.content;
}

/**
 * Generate kids follow along
 * @param {OpenAI} openai - OpenAI client instance
 * @param {string} model - Model to use for generation
 * @param {string} transcript - The sermon transcript
 * @returns {Promise<string>} - The generated kids content
 */
async function generateKidsFollowAlong(openai, model, transcript) {
  const prompt = `
    Create a one-page "Follow Along" activity sheet for elementary-age children (6-11) based on this sermon transcript. Include:
    1. A simple, child-friendly explanation of the main sermon point
    2. 3-4 fill-in-the-blank statements to help kids listen for key points
    3. A word search with 5-8 key terms from the sermon
    4. A simple drawing activity related to the sermon theme
    5. One "take home" application question for family discussion

    Format your response as if creating a printable activity sheet.

    SERMON TRANSCRIPT:
    ${transcript}
  `;
  
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 1200
  });
  
  return response.choices[0].message.content;
}