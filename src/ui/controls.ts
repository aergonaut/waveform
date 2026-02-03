export class Controls {
  private helpHintElement: HTMLElement;
  private helpOverlay: HTMLElement;
  private isHelpVisible = false;

  private onVisualizerChange: (index: number) => void;
  private onColorSchemeChange: (index: number) => void;

  constructor(
    onVisualizerChange: (index: number) => void,
    onColorSchemeChange: (index: number) => void
  ) {
    this.onVisualizerChange = onVisualizerChange;
    this.onColorSchemeChange = onColorSchemeChange;

    this.helpHintElement = document.querySelector('.control-hint')!;
    this.helpOverlay = document.getElementById('help-overlay')!;

    this.setupKeyboardControls();
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (e) => {
      // Visualizer selection (1, 2, 3)
      if (e.key >= '1' && e.key <= '3') {
        const index = parseInt(e.key) - 1;
        this.onVisualizerChange(index);
      }

      // Color scheme selection (Q, W, E, R, T)
      const colorSchemeKeys = ['q', 'w', 'e', 'r', 't'];
      const colorIndex = colorSchemeKeys.indexOf(e.key.toLowerCase());
      if (colorIndex !== -1) {
        this.onColorSchemeChange(colorIndex);
      }

      // Help toggle (H or Escape)
      if (e.key.toLowerCase() === 'h' || e.key === 'Escape') {
        this.toggleHelp();
      }
    });
  }

  private toggleHelp(): void {
    this.isHelpVisible = !this.isHelpVisible;
    if (this.isHelpVisible) {
      this.helpOverlay.classList.remove('hidden');
    } else {
      this.helpOverlay.classList.add('hidden');
    }
  }

  show(): void {
    this.helpHintElement.classList.remove('hidden');
  }

  hide(): void {
    this.helpHintElement.classList.add('hidden');
  }
}
