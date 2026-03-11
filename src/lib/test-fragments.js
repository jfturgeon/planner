/**
 * Fragment Loader Test
 * Simple test to verify that HTML fragments load correctly
 */

async function testFragmentLoading() {
  console.log('🧪 Testing fragment loading...');
  
  const fragmentPaths = [
    './public/html/fragments/head.html',
    './public/html/fragments/header.html',
    './public/html/fragments/footer.html',
    './public/html/fragments/login.html',
    './public/html/fragments/modals.html',
    './public/html/views/month.html',
    './public/html/views/annual.html',
    './public/html/views/weekly.html',
    './public/html/views/habits.html',
    './public/html/views/tracker.html',
    './public/html/views/kanban.html',
    './public/html/views/contacts.html',
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const path of fragmentPaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        console.log(`✅ ${path}`);
        successCount++;
      } else {
        console.error(`❌ ${path} - Status: ${response.status}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ ${path} - Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Fragment Loading Test Results:`);
  console.log(`✅ Success: ${successCount}/${fragmentPaths.length}`);
  console.log(`❌ Failed: ${errorCount}/${fragmentPaths.length}`);
  
  return errorCount === 0;
}

// Run test when document is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testFragmentLoading);
} else {
  testFragmentLoading();
}
