export interface IInitable {
  get Declaration(): string;
}

class InitRepository {
  readonly #initables: Array<IInitable> = [];

  RegisterInitable(item: IInitable) {
    this.#initables.push(item);
  }
}

export const Init = new InitRepository();
