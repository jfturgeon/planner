/**
 * Component Loader - Charge les composants HTML externes
 * Permet une meilleure séparation des concerns et maintenabilité
 */

const ComponentLoader = {
  /**
   * Charge un composant HTML et l'injecte dans le DOM
   * @param {string} componentPath - Chemin du fichier .html (ex: 'src/components/header.html')
   * @param {string} targetSelector - Sélecteur du conteneur (ex: '#app-header')
   * @returns {Promise<void>}
   */
  async loadComponent(componentPath, targetSelector) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${componentPath}`);
      
      const html = await response.text();
      const target = document.querySelector(targetSelector);
      
      if (!target) {
        console.warn(`⚠ Target not found: ${targetSelector}`);
        return;
      }
      
      target.innerHTML = html;
      console.log(`✓ Component loaded: ${componentPath}`);
      
      // Émettre un événement personnalisé quand le composant est chargé
      const event = new CustomEvent('componentLoaded', { 
        detail: { path: componentPath, target: targetSelector }
      });
      document.dispatchEvent(event);
      
      // Retourner une Promise résolue après un petit délai
      return new Promise(resolve => {
        // Donner le temps au navigateur de rendre le DOM
        setTimeout(() => resolve(), 0);
      });
    } catch (error) {
      console.error(`✗ Error loading component ${componentPath}:`, error);
      return Promise.reject(error);
    }
  },

  /**
   * Charge plusieurs composants en parallèle
   * @param {Array<{path: string, target: string}>} components
   * @returns {Promise<void[]>}
   */
  async loadComponents(components) {
    return Promise.all(
      components.map(comp => this.loadComponent(comp.path, comp.target))
    );
  },

  /**
   * Charge un composant et attend que le DOM soit prêt
   * @param {string} componentPath
   * @param {string} targetSelector
   */
  loadWhenReady(componentPath, targetSelector) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        await this.loadComponent(componentPath, targetSelector);
      });
    } else {
      return this.loadComponent(componentPath, targetSelector);
    }
  }
};

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentLoader;
}
