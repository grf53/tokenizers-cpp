import Module from "./tokenizers_binding"

let binding: any = null;

async function asyncInitTokenizers() {
  if (binding == null) {
    binding = await Module();
  }
}

/**
 * A universal tokenizer that is backed by either
 * HF tokenizers rust library or sentencepiece
 */
export class Tokenizer {
  private handle: any;

  private constructor(tokenizer) {
    this.handle = tokenizer;
  }

  /**
   * Dispose this tokenizer.
   *
   * Call this function when we no longer needs to
   */
  dispose() {
    this.handle.delete();
  }

  /**
   * Encode text to token ids.
   *
   * @param text Input text.
   * @returns The output tokens
   */
  encode(text: string): Int32Array {
    const ids = this.handle.Encode(text);
    const arr = binding.vecIntToView(ids).slice();
    ids.delete();
    return arr;
  }

  /**
   * Decode the token ids into string.
   *
   * @param ids the input ids.
   * @returns The decoded string.
   */
  decode(ids: Int32Array): string {
    const vec = binding.vecIntFromJSArray(ids);
    const res = this.handle.Decode(vec).slice();
    vec.delete();
    return res;
  }

  /**
   * Returns the vocabulary size. Special tokens are considered.
   *
   * @returns Vocab size.
   */
  getVocabSize(): number {
    const res = this.handle.GetVocabSize();
    return res;
  }

  /**
   * Convert the given id to its corresponding token if it exists. If not, return an empty string.
   *
   * @param id the input id.
   * @returns The decoded string.
   */
  idToToken(id: number): string {
    const res = this.handle.IdToToken(id).slice();
    return res;
  }

  /**
   * Convert the given token to its corresponding id if it exists. If not, return -1.
   *
   * @param token the input token string.
   * @returns The encoded token id.
   */
  tokenToId(token: string): number {
    const id = this.handle.TokenToId(token.slice());
    return id;
  }

  /**
   * Create a tokenizer from jsonArrayBuffer
   *
   * @param json The input array buffer that contains json text.
   * @returns The tokenizer
   */
  static async fromJSON(json: ArrayBuffer): Promise<Tokenizer> {
    await asyncInitTokenizers();
    return new Tokenizer(binding.Tokenizer.FromBlobJSON(json));
  }

  /**
   * Create a tokenizer from byte-level BPE blobs.
   *
   * @param vocab The vocab blob.
   * @param merges The merges blob.
   * @param addedTokens The addedTokens blob
   * @returns The tokenizer
   */
  static async fromByteLevelBPE(
    vocab: ArrayBuffer,
    merges: ArrayBuffer,
    addedTokens = ""
  ): Promise<Tokenizer> {
    await asyncInitTokenizers();
    return new Tokenizer(
      binding.Tokenizer.FromBlobByteLevelBPE(vocab, merges, addedTokens));
  }

  /**
   * Create a tokenizer from sentencepiece model.
   *
   * @param model The model blob.
   * @returns The tokenizer
   */
  static async fromSentencePiece(model: ArrayBuffer): Promise<Tokenizer> {
    await asyncInitTokenizers();
    return new Tokenizer(
      binding.Tokenizer.FromBlobSentencePiece(model));
  }
}
