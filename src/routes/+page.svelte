<script>
  import { 
    extractTextFromFile, 
    processTranscript, 
    getTranscriptState, 
    resetTranscript 
  } from '$lib/transcript-store.svelte.js';
  
  let files = $state(null);
  let dragging = $state(false);
  let fileError = $state('');
  let uploadProgress = $state(0);
  let fileUploaded = $state(false);
  let processingFile = $state(false);
  
  // Get the reactive transcript state
  const transcriptState = getTranscriptState();
  
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
    const validAudioTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'];
    const validTextTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validAudioTypes.includes(file.type) && !validTextTypes.includes(file.type)) {
      fileError = 'Please upload an audio file (MP3, WAV) or text file (TXT, PDF, DOC, DOCX)';
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
    resetTranscript();
  }
  
  async function processFile() {
    if (!files || !files[0]) return;
    
    processingFile = true;
    try {
      // Extract text from the file
      const text = await extractTextFromFile(files[0]);
      
      // Process the extracted text
      processTranscript(text);
      
      // Navigate to results page or show results
      console.log('Transcript processed:', transcriptState.processedText);
      
    } catch (error) {
      console.error('Error processing file:', error);
      fileError = `Error processing file: ${error.message}`;
    } finally {
      processingFile = false;
    }
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
        {#if !files || !fileUploaded}
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
                <p class="text-sm text-gray-400 mb-6">Supports MP3, WAV audio files or text documents (TXT, PDF, DOC, DOCX)</p>
                
                <label class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors">
                  Select File
                  <input type="file" class="hidden" accept=".mp3,.wav,.txt,.pdf,.doc,.docx" onchange={handleFileSelect} />
                </label>
                
                {#if fileError}
                  <p class="mt-4 text-red-500">{fileError}</p>
                {/if}
              {/if}
            </div>
          </div>
        {:else if fileUploaded && !processingFile && !transcriptState.isLoading && !transcriptState.rawText}
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <div class="flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-2xl font-medium text-gray-800 mb-2">File uploaded successfully!</h2>
            <p class="text-gray-600 mb-6">{files[0].name}</p>
            
            <div class="flex justify-center space-x-4">
              <button 
                onclick={resetUpload}
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors">
                Upload a different file
              </button>
              <button 
                onclick={processFile}
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Process this file
              </button>
            </div>
          </div>
        {:else if processingFile || transcriptState.isLoading}
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <div class="flex flex-col items-center justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <h2 class="text-xl font-medium text-gray-700 mb-2">Processing your file...</h2>
              <p class="text-gray-500">This may take a few moments. {files[0].type.startsWith('audio/') ? 'Audio transcription takes longer.' : ''}</p>
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
            <h2 class="text-2xl font-medium text-gray-800 mb-4">Extracted Text</h2>
            <div class="bg-gray-50 p-4 rounded-lg mb-6 max-h-96 overflow-y-auto whitespace-pre-wrap text-left">
              {transcriptState.rawText}
            </div>
            
            <div class="flex justify-between">
              <button 
                onclick={resetUpload}
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors">
                Start Over
              </button>
              <button 
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Continue with Analysis
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