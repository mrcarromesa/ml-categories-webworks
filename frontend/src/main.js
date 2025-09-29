document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const statusElement = document.getElementById('status');
  const resultElement = document.getElementById('results');

  if (!window.Worker) {
    statusElement.textContent = 'Web Workers are not supported in this browser.';
    return;
  }

  const worker = new Worker('worker.js');
  
  startButton.addEventListener('click', () => {
    statusElement.textContent = 'Processing...';
    resultElement.textContent = '';
    startButton.disabled = true;

    worker.postMessage({ type: 'start' });
  });

  worker.onmessage = (event) => {
    const { type, payload } = event.data;
    switch (type) {
      case 'data':
        

        if (payload.hasChildren) {
          return;
        }

        if (!payload.isEnabled) {
          return;
        }

        const li = document.createElement('li');
        li.textContent = `INSERT INTO web_api_ml_categories (id, catalog_domain, name, category_path, category_search_string) 
                            VALUES ("${payload.id}", "${payload.catalog_domain}", "${payload.name}", "${payload.category_path}", "${payload.category_search_string}");`;
        resultElement.appendChild(li);
        break;
      case 'progress':
        statusElement.textContent = `Processed ${payload} items...`;
        break;
      case 'done':
        statusElement.textContent = `Processed ${payload} items.`;
        startButton.disabled = false;
        break;
      case 'error':
        statusElement.textContent = `Error: ${payload}`;
        startButton.disabled = false;
        break;
    }
  };

  worker.onerror = (event) => {
    statusElement.textContent = `Error: ${event.message}`;
    startButton.disabled = false;
  };
});