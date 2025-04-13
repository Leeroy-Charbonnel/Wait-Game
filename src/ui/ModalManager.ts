export class ModalManager {
  private modalElement: HTMLDivElement | null = null;
  private modalContentElement: HTMLDivElement | null = null;
  private modalButtonsElement: HTMLDivElement | null = null;
  
  constructor() {
    this.createModalElements();
  }
  
  private createModalElements(): void {
    // Create modal container
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'modal-container';
    this.modalElement.style.display = 'none';
    
    // Create modal content
    this.modalContentElement = document.createElement('div');
    this.modalContentElement.className = 'modal-content';
    this.modalElement.appendChild(this.modalContentElement);
    
    // Create modal buttons container
    this.modalButtonsElement = document.createElement('div');
    this.modalButtonsElement.className = 'modal-buttons';
    this.modalElement.appendChild(this.modalButtonsElement);
    
    // Add modal to document
    document.body.appendChild(this.modalElement);
  }
  
  public showAlert(message: string): void {
    if (!this.modalElement || !this.modalContentElement || !this.modalButtonsElement) {
      return;
    }
    
    // Set message
    this.modalContentElement.innerHTML = '';
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    this.modalContentElement.appendChild(messageElement);
    
    // Clear and add OK button
    this.modalButtonsElement.innerHTML = '';
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.onclick = () => this.hideModal();
    this.modalButtonsElement.appendChild(okButton);
    
    // Show modal
    this.modalElement.style.display = 'flex';
    
    // Focus the OK button
    okButton.focus();
  }
  
  public showConfirm(message: string, onConfirm: () => void, onCancel?: () => void): void {
    if (!this.modalElement || !this.modalContentElement || !this.modalButtonsElement) {
      return;
    }
    
    // Set message
    this.modalContentElement.innerHTML = '';
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    this.modalContentElement.appendChild(messageElement);
    
    // Clear and add buttons
    this.modalButtonsElement.innerHTML = '';
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
      this.hideModal();
      if (onCancel) onCancel();
    };
    this.modalButtonsElement.appendChild(cancelButton);
    
    // Confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = () => {
      this.hideModal();
      onConfirm();
    };
    this.modalButtonsElement.appendChild(confirmButton);
    
    // Show modal
    this.modalElement.style.display = 'flex';
    
    // Focus the confirm button
    confirmButton.focus();
  }
  
  private hideModal(): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
    }
  }
}
