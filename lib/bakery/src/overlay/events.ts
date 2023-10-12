export class CloseRequestedEvent extends Event {
  constructor() {
    super("CloseRequested", {
      cancelable: true,
      bubbles: true,
      composed: true,
    });
  }
}
