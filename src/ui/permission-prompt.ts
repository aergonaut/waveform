export class PermissionPrompt {
  private element: HTMLElement;
  private startButton: HTMLButtonElement;
  private errorMessage: HTMLElement;
  private onStart: () => Promise<void>;

  constructor(onStart: () => Promise<void>) {
    this.onStart = onStart;

    this.element = document.getElementById('permission-prompt')!;
    this.startButton = document.getElementById('start-button') as HTMLButtonElement;
    this.errorMessage = document.getElementById('error-message')!;

    this.startButton.addEventListener('click', () => this.handleStart());
  }

  private async handleStart(): Promise<void> {
    this.startButton.disabled = true;
    this.startButton.textContent = 'Starting...';
    this.errorMessage.textContent = '';

    try {
      await this.onStart();
      this.hide();
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Failed to start visualization');
      this.startButton.disabled = false;
      this.startButton.textContent = 'Try Again';
    }
  }

  private showError(message: string): void {
    this.errorMessage.textContent = message;
  }

  hide(): void {
    this.element.classList.add('hidden');
  }

  show(): void {
    this.element.classList.remove('hidden');
  }
}
