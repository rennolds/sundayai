<script>
  import { 
    extractTextFromFile, 
    processTranscript, 
    getTranscriptState, 
    resetTranscript 
  } from '$lib/transcript-store.svelte.js';
  
  import {
    generateAIContent,
    getContentState,
    resetContent
  } from '$lib/content-store.svelte.js';
  
  // Import our React component
  import ContentResults from '$lib/ContentResults.svelte';
  
  let files = $state(null);
  let dragging = $state(false);
  let fileError = $state('');
  let uploadProgress = $state(0);
  let fileUploaded = $state(false);
  let processingFile = $state(false);
  let showResults = $state(false);
  
  // Selected sermon processing options
  let selectedOptions = $state({
    sermonPrep: {
      critique: false,
      perspectiveFeedback: false
    },
    sundayContent: {
      bibleStudyGuide: false,
      kidsFollowAlong: false
    }
  });
  
  // Get the reactive transcript state
  const transcriptState = getTranscriptState();
  
  // Get the reactive content state
  const contentState = getContentState();
  
  function handleFileSelect(event) {
    const selectedFiles = event.target.files;
    validateAndProcessFiles(selectedFiles);
  }
  
  function handleDrop(event) {
    event.preventDefault();
    dragging = false;
    
    if (event.dataTransfer.items) {
      const selectedFiles = event.dataTransfer.files;
      validateAndProcessFiles(selectedFiles);
    }
  }
  
  function validateAndProcessFiles(selectedFiles) {
    if (!selectedFiles || selectedFiles.length === 0) {
      fileError = 'Please select a file';
      return;
    }
    
    const file = selectedFiles[0];
    const validAudioTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'video/mp4'];
    const validTextTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    // Check file type
    if (!validAudioTypes.includes(file.type) && !validTextTypes.includes(file.type)) {
      fileError = 'Please upload an audio file (MP3, WAV, MP4, M4A) or text file (TXT, PDF, DOC, DOCX)';
      return;
    }
    
    // Check file size if it's an audio file (25MB limit for Whisper API)
    if (validAudioTypes.includes(file.type) && file.size > 25 * 1024 * 1024) {
      fileError = 'Audio files must be under 25MB for transcription. Please compress your file or upload a shorter recording.';
      return;
    }
    
    fileError = '';
    files = selectedFiles;
    
    // Simulate upload progress
    simulateFileUpload();
  }
  
  function simulateFileUpload() {
    const interval = setInterval(() => {
      uploadProgress += 5;
      
      if (uploadProgress >= 100) {
        clearInterval(interval);
        fileUploaded = true;
      }
    }, 100);
  }
  
  function handleDragOver(event) {
    event.preventDefault();
    dragging = true;
  }
  
  function handleDragLeave() {
    dragging = false;
  }

  function resetUpload() {
    files = null;
    fileUploaded = false;
    uploadProgress = 0;
    showResults = false;
    resetTranscript();
    resetContent();

    // Reset selected options
    selectedOptions = {
      sermonPrep: {
        critique: false,
        perspectiveFeedback: false
      },
      sundayContent: {
        bibleStudyGuide: false,
        kidsFollowAlong: false
      }
    };
  }
  
  async function processFile() {
    if (!files || !files[0]) return;
    
    processingFile = true;
    try {
      // Extract text from the file
      const text = await extractTextFromFile(files[0]);
      
      // Process the extracted text
      processTranscript(text);
      
      console.log('Transcript processed:', transcriptState.processedText);
      
    } catch (error) {
      console.error('Error processing file:', error);
      fileError = `Error processing file: ${error.message}`;
    } finally {
      processingFile = false;
    }
  }
  
  // Effect to automatically process the file when uploaded
  $effect(() => {
    if (fileUploaded && !processingFile && !transcriptState.isLoading && !transcriptState.rawText) {
      processFile();
    }
  });

  async function handleGenerateContent() {
    console.log('Generating content with selected options:', selectedOptions);
    
    try {
      // Generate content based on transcript and selected options
      await generateAIContent(transcriptState.rawText, selectedOptions);
      showResults = true;
    } catch (error) {
      console.error('Error generating content:', error);
      fileError = `Error generating content: ${error.message}`;
    }
  }
  
  function handleBackToOptions() {
    showResults = false;
  }

  function hasSelectedOptions() {
    return (
      selectedOptions.sermonPrep.critique || 
      selectedOptions.sermonPrep.perspectiveFeedback || 
      selectedOptions.sundayContent.bibleStudyGuide || 
      selectedOptions.sundayContent.kidsFollowAlong
    );
  }
  
  // Determine if the file is an audio file
  function isAudioFile(file) {
    return file && file.type && file.type.startsWith('audio/');
  }
  
  // Download the transcript as a text file
  function downloadTranscript() {
    if (!transcriptState.rawText) return;
    
    // Create filename based on original file
    const originalFilename = files[0]?.name || 'transcript';
    const baseFilename = originalFilename.split('.').slice(0, -1).join('.') || 'transcript';
    const filename = `${baseFilename}_transcript.txt`;
    
    // Create a blob with the transcript text
    const blob = new Blob([transcriptState.rawText], { type: 'text/plain' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <div class="container mx-auto px-4 py-16">
    <header class="text-center mb-16">
      <h1 class="text-5xl font-bold text-gray-800 mb-2">SundayAI</h1>
      <p class="text-xl text-gray-600">Automate Sunday with AI</p>
    </header>
    
    <main class="flex-grow">
      <div class="max-w-3xl mx-auto">
        {#if contentState.error}
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <div class="flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-medium text-gray-800 mb-2">Error Generating Content</h2>
            <p class="text-red-500 mb-6">{contentState.error}</p>
            
            <button 
              onclick={() => showResults = false}
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              Back to Options
            </button>
          </div>
        {:else if showResults}
          <!-- Show AI-generated content results -->
          <ContentResults 
            isLoading={contentState.isGenerating} 
            results={contentState.results} 
            onBackClick={handleBackToOptions} 
          />
        {:else if !files || !fileUploaded}
          <div 
            class="border-2 border-dashed rounded-lg p-10 text-center transition-colors
            {dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}"
            ondragover={handleDragOver}
            ondragleave={handleDragLeave}
            ondrop={handleDrop}
          >
            <div class="flex flex-col items-center justify-center">
              {#if uploadProgress > 0 && uploadProgress < 100}
                <div class="w-full max-w-md mb-4">
                  <div class="relative pt-1">
                    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div 
                        style="width:{uploadProgress}%" 
                        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300">
                      </div>
                    </div>
                    <p class="text-center text-gray-600">Uploading... {uploadProgress}%</p>
                  </div>
                </div>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h2 class="text-xl font-medium text-gray-700 mb-2">Upload your transcript or sermon audio</h2>
                <p class="text-gray-500 mb-4">Drag and drop your file here, or click to select files</p>
                <div class="text-sm text-gray-400 mb-6">
                  <p>Supports MP3, WAV, MP4, M4A audio files or text documents (TXT, PDF, DOC, DOCX)</p>
                  <p class="mt-1 text-blue-500 font-medium">Audio files will be transcribed automatically using AI</p>
                  <p class="mt-1 text-yellow-600">Note: Audio files must be under 25MB</p>
                </div>
                
                <label class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors">
                  Select File
                  <input type="file" class="hidden" accept=".mp3,.wav,.txt,.pdf,.doc,.docx,.mp4,.m4a,audio/*,video/mp4" onchange={handleFileSelect} />
                </label>
                
                {#if fileError}
                  <p class="mt-4 text-red-500">{fileError}</p>
                {/if}
              {/if}
            </div>
          </div>
        {:else if fileUploaded && !processingFile && !transcriptState.isLoading && !transcriptState.rawText}
          <!-- Automatically process the file when it's uploaded successfully -->
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <div class="flex flex-col items-center justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <h2 class="text-xl font-medium text-gray-700 mb-2">Processing {files[0].name}...</h2>
              <p class="text-gray-500">This may take a few moments.</p>
            </div>
          </div>
        {:else if processingFile || transcriptState.isLoading}
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <div class="flex flex-col items-center justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <h2 class="text-xl font-medium text-gray-700 mb-2">
                {#if isAudioFile(files[0])}
                  Transcribing your audio...
                {:else}
                  Processing your file...
                {/if}
              </h2>
              <p class="text-gray-500">
                {#if isAudioFile(files[0])}
                  Audio transcription may take several minutes depending on the file length.
                {:else}
                  This may take a few moments.
                {/if}
              </p>
            </div>
          </div>
        {:else if transcriptState.error}
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <div class="flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-medium text-gray-800 mb-2">Error Processing File</h2>
            <p class="text-red-500 mb-6">{transcriptState.error}</p>
            
            <button 
              onclick={resetUpload}
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              Try Again
            </button>
          </div>
        {:else if transcriptState.rawText}
          <div class="bg-white rounded-lg shadow-md p-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-medium text-gray-800">What would you like to do with your transcript?</h2>
              {#if isAudioFile(files[0])}
                <div class="flex items-center space-x-2">
                  <button 
                    onclick={downloadTranscript}
                    class="inline-flex items-center px-3 py-1 border border-green-500 rounded-md text-sm font-medium bg-white text-green-700 hover:bg-green-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Transcript
                  </button>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    AI Transcribed
                  </span>
                </div>
              {/if}
            </div>
            
            <!-- Transcript preview -->
            <div class="bg-gray-50 p-4 rounded-lg mb-6 max-h-48 overflow-y-auto whitespace-pre-wrap text-left text-sm">
              {transcriptState.rawText.slice(0, 500)}...
            </div>
            
            <!-- Two-column options layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <!-- Left Column: Sermon Prep -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Sermon Prep
                </h3>
                
                <div class="space-y-3">
                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="form-checkbox h-5 w-5 text-blue-600 rounded" 
                      checked={selectedOptions.sermonPrep.critique}
                      onchange={() => selectedOptions.sermonPrep.critique = !selectedOptions.sermonPrep.critique}
                    />
                    <span class="text-gray-700">Critique my sermon</span>
                  </label>
                  
                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="form-checkbox h-5 w-5 text-blue-600 rounded" 
                      checked={selectedOptions.sermonPrep.perspectiveFeedback}
                      onchange={() => selectedOptions.sermonPrep.perspectiveFeedback = !selectedOptions.sermonPrep.perspectiveFeedback}
                    />
                    <span class="text-gray-700">Perspective feedback</span>
                  </label>
                </div>
              </div>
              
              <!-- Right Column: Sunday Content -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Sunday Content
                </h3>
                
                <div class="space-y-3">
                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="form-checkbox h-5 w-5 text-blue-600 rounded" 
                      checked={selectedOptions.sundayContent.bibleStudyGuide}
                      onchange={() => selectedOptions.sundayContent.bibleStudyGuide = !selectedOptions.sundayContent.bibleStudyGuide}
                    />
                    <span class="text-gray-700">Bible Study Leaders Guide</span>
                  </label>
                  
                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="form-checkbox h-5 w-5 text-blue-600 rounded" 
                      checked={selectedOptions.sundayContent.kidsFollowAlong}
                      onchange={() => selectedOptions.sundayContent.kidsFollowAlong = !selectedOptions.sundayContent.kidsFollowAlong}
                    />
                    <span class="text-gray-700">For The Kids: Follow along</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="flex justify-between">
              <button 
                onclick={resetUpload}
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors">
                Start Over
              </button>
              <button 
                onclick={handleGenerateContent}
                disabled={!hasSelectedOptions()}
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                GO
              </button>
            </div>
          </div>
        {/if}
      </div>
    </main>
    
    <footer class="mt-16 text-center">
      <p class="text-sm text-gray-500">&copy; 2025 SundayAI. All rights reserved.</p>
    </footer>
  </div>
</div>