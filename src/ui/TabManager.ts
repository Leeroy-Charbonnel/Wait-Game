import { UIManager } from './UIManager';
import { TabID } from '../types';

interface Tab {
  id: TabID;
  name: string;
}

export class TabManager {
  private tabs: Tab[] = [];
  private tabElements: Map<TabID, HTMLElement> = new Map();
  private contentElements: Map<TabID, HTMLElement> = new Map();
  private activeTabId: TabID | null = null;
  
  constructor(private uiManager: UIManager, private rootElement: HTMLElement) {}
  
  public createTabs(tabs: Tab[]): void {
    this.tabs = tabs;
    
    // Create the tab container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    this.rootElement.appendChild(tabsContainer);
    
    // Create the tab navigation
    const tabNav = document.createElement('div');
    tabNav.className = 'tab-nav';
    tabsContainer.appendChild(tabNav);
    
    // Create the tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabsContainer.appendChild(tabContent);
    
    // Create each tab and its content area
    tabs.forEach(tab => {
      // Create tab button
      const tabButton = document.createElement('button');
      tabButton.className = 'tab-button';
      tabButton.textContent = tab.name;
      tabButton.onclick = () => this.selectTab(tab.id);
      tabNav.appendChild(tabButton);
      
      // Store the tab button element
      this.tabElements.set(tab.id, tabButton);
      
      // Create tab content area
      const contentElement = document.createElement('div');
      contentElement.className = 'tab-pane';
      contentElement.id = `tab-${tab.id}`;
      contentElement.style.display = 'none';
      tabContent.appendChild(contentElement);
      
      // Store the content element
      this.contentElements.set(tab.id, contentElement);
    });
  }
  
  public selectTab(tabId: TabID): void {
    // Hide all tabs
    this.contentElements.forEach(element => {
      element.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    this.tabElements.forEach(element => {
      element.classList.remove('active');
    });
    
    // Show the selected tab
    const tabContent = this.contentElements.get(tabId);
    if (tabContent) {
      tabContent.style.display = 'block';
    }
    
    // Add active class to the selected tab button
    const tabButton = this.tabElements.get(tabId);
    if (tabButton) {
      tabButton.classList.add('active');
    }
    
    this.activeTabId = tabId;
  }
  
  public getTabContent(tabId: TabID): HTMLElement | undefined {
    return this.contentElements.get(tabId);
  }
  
  public getActiveTabId(): TabID | null {
    return this.activeTabId;
  }
}
