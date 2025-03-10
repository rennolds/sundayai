<script>
    let { isLoading, results, onBackClick } = $props();
    
    let activeTab = $state(Object.keys(results)[0] || '');
    
    // Watch for changes in results and update activeTab if needed
    $effect(() => {
      const resultKeys = Object.keys(results);
      if (resultKeys.length > 0 && !resultKeys.includes(activeTab)) {
        activeTab = resultKeys[0];
      }
    });
  
    // Function to get the nice display name for each result type
    function getDisplayName(key) {
      switch(key) {
        case 'critique': return 'Sermon Critique';
        case 'perspectiveFeedback': return 'Perspective Feedback';
        case 'bibleStudyGuide': return 'Bible Study Guide';
        case 'kidsFollowAlong': return 'Kids Follow Along';
        default: return key;
      }
    }
  
    // Download content as text file
    function downloadContent(content, filename) {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }
  
    // Format the content with proper formatting
    function formatContent(content) {
      if (!content) return '';
      
      // Split content by lines and process each line
      return content.split('\n').map((line, i) => {
        // Skip empty lines
        if (!line.trim()) return `<br key="${i}" />`;
        
        // Check if it's a heading
        if (line.trim().startsWith('# ')) {
          return `<h1 class="text-2xl font-bold my-4">${line.replace('# ', '')}</h1>`;
        }
        if (line.trim().startsWith('## ')) {
          return `<h2 class="text-xl font-bold my-3">${line.replace('## ', '')}</h2>`;
        }
        if (line.trim().startsWith('### ')) {
          return `<h3 class="text-lg font-bold my-2">${line.replace('### ', '')}</h3>`;
        }
        
        // Check if it's a bullet point
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return `<li class="ml-5">${line.replace(/^[-*]\s/, '')}</li>`;
        }
        
        // Check if it's a numbered list
        if (/^\d+\.\s/.test(line.trim())) {
          return `<li class="ml-5 list-decimal">${line.replace(/^\d+\.\s/, '')}</li>`;
        }
        
        // Regular paragraph
        return `<p class="my-2">${line}</p>`;
      }).join('');
    }
  </script>
  
  <div class="bg-white rounded-lg shadow-md">
    {#if isLoading}
      <div class="flex flex-col items-center justify-center py-12 p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <h2 class="text-xl font-medium text-gray-700 mb-2">Generating your content...</h2>
        <p class="text-gray-500">This may take a minute or two.</p>
      </div>
    {:else}
      <!-- Tabs for different content types -->
      <div class="flex overflow-x-auto border-b border-gray-200">
        {#each Object.keys(results) as key}
          <button
            onclick={() => activeTab = key}
            class={`flex items-center px-4 py-3 font-medium text-sm focus:outline-none ${
              activeTab === key
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {#if key === 'critique'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            {:else if key === 'perspectiveFeedback'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            {:else if key === 'bibleStudyGuide'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            {:else if key === 'kidsFollowAlong'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            {/if}
            {getDisplayName(key)}
          </button>
        {/each}
      </div>
      
      <!-- Content area -->
      {#if activeTab && results[activeTab]}
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">{getDisplayName(activeTab)}</h2>
            <div class="space-x-2">
              <button
                onclick={() => downloadContent(results[activeTab], getDisplayName(activeTab))}
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
          
          <div class="prose max-w-none overflow-auto" style="max-height: 60vh;">
            {@html formatContent(results[activeTab])}
          </div>
        </div>
      {/if}
      
      <!-- Bottom actions -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-between">
        <button
          onclick={onBackClick}
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Options
        </button>
      </div>
    {/if}
  </div>