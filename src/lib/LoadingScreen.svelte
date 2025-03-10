<script>
    let { message = "Generating your content..." } = $props();
  </script>
  
  <div class="bg-white rounded-lg shadow-md p-8 text-center">
    <div class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-6"></div>
      <h2 class="text-2xl font-medium text-gray-800 mb-4">{message}</h2>
      <p class="text-gray-500 max-w-md">
        We're using AI to create your content. This may take a minute or two depending on the complexity of your sermon and the number of items you've selected.
      </p>
    </div>
  </div>