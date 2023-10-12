export class CloseRequestedEvent extends Event {
  constructor() {
    super("CloseRequested", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
  }
}
