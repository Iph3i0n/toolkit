import { State } from "local/server";

export class MessageService {
  static readonly #BundleSize = 200n;
  static readonly #LogsPerRequest = 20;

  readonly #state: State;

  constructor(state: State) {
    this.#state = state;
  }

  #LogFileIndex(message_index: bigint) {
    return message_index / MessageService.#BundleSize;
  }

  #LineNumber(message_index: bigint) {
    return Number(message_index % MessageService.#BundleSize);
  }

  Range(channel_id: string, offset: bigint) {
    const count = this.#state.message_counts[channel_id] ?? 0n;
    if (offset >= count) return [];
    const message_index = count - offset - 1n;
    const start = this.#LineNumber(message_index);

    const data =
      this.#state.messages[
        `${channel_id}.${this.#LogFileIndex(message_index)}`
      ] ?? [];

    const final = Math.max(start - MessageService.#LogsPerRequest, 0);
    return data.slice(final, start + 1);
  }

  Latest(channel_id: string) {
    const count = this.#state.message_counts[channel_id] ?? 0n;

    const name = `${channel_id}.${this.#LogFileIndex(count)}`;
    return {
      data: this.#state.messages[name] ?? [],
      name,
      count,
    };
  }
}
