/**
 * HTML Fragment Loader
 * Dynamically loads and injects HTML fragments into the document
 */

class FragmentLoader {
  static
  static cache = {};
  
  /**
   * Load an HTML fragment
   * @param {string} path - Path to the HTML fragment
   * @returns {Promise<string>} - HTML content
   */
  static async load(path) {
    if (this.cache[path]) {
      return this.cache[path];
    }
    
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      const content = await response.text();
      this.cache[path] = content;
      return content;
    } catch (error) {
      console.error(`Error loading fragment: ${path}`, error);
      return '';
    }
  }
  
  /**
   * Load and inject multiple fragments
   * @param {Object} fragments - { selector: path, ... }
   */
  static async loadAll(fragments) {
    const promises = Object.entries(fragments).map(async ([selector, path]) => {
      const content = await this.load(path);
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML += content;
      }
    });
    
    await Promise.all(promises);
  }
  
  /**
   * Convenience method: load common fragments
   */
  static async loadCommonFragments() {
    // Load footer and login to body
    const footerHTML = await this.load('./public/html/fragments/footer.html');
    const loginHTML = await this.load('./public/html/fragments/login.html');
    document.body.insertAdjacentHTML('afterbegin', footerHTML);
    document.body.insertAdjacentHTML('afterbegin', loginHTML);
    
    // Load header and views into appView container
    const appViewHTML = await this.load('./public/html/fragments/header.html');
    const annualViewHTML = await this.load('./public/html/views/annual.html');
    const monthViewHTML = await this.load('./public/html/views/month.html');
    const weeklyViewHTML = await this.load('./public/html/views/weekly.html');
    const habitsViewHTML = await this.load('./public/html/views/habits.html');
    const trackerViewHTML = await this.load('./public/html/views/tracker.html');
    const kanbanViewHTML = await this.load('./public/html/views/kanban.html');
    const contactsViewHTML = await this.load('./public/html/views/contacts.html');
    const modalsHTML = await this.load('./public/html/fragments/modals.html');
    
    const appView = document.createElement('div');
    appView.id = 'appView';
    appView.style.display = 'none';
    appView.innerHTML = appViewHTML + 
                       annualViewHTML + 
                       monthViewHTML + 
                       weeklyViewHTML + 
                       habitsViewHTML + 
                       trackerViewHTML + 
                       kanbanViewHTML + 
                       contactsViewHTML + 
                       modalsHTML;
    
    document.body.insertBefore(appView, document.body.querySelector('footer'));
    
    // Dispatch custom event to signal that fragments are loaded
    document.dispatchEvent(new CustomEvent('fragmentsLoaded'));
  }
}

export default FragmentLoader;
