import { PublicKey } from "@solana/web3.js";
import { PublicKeyIsh, validateAndParsePublicKey } from "../common";
import { SOL, WSOL } from "../token";

/**
 * A currency is any fungible financial instrument on Solana, including SOL and all SPL tokens.
 *
 * The only instance of the base class `Currency` is SOL.
 */
export class Currency {
  public readonly symbol?: string;
  public readonly name?: string;

  public readonly decimals: number;

  /**
   * The only instance of the base class `Currency`.
   */
  public static readonly SOL: Currency = new Currency(SOL.decimals, SOL.symbol, SOL.name);

  /**
   * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.SOL`.
   * @param decimals - decimals of the currency
   * @param symbol - symbol of the currency
   * @param name - name of the currency
   */
  public constructor(decimals: number, symbol?: string, name?: string) {
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }
}

/**
 * Represents an SPL token with a unique address and some metadata.
 */
export class Token extends Currency {
  public readonly mint: PublicKey;

  /**
   * The only instance of the base class `Token`.
   */
  public static readonly WSOL: Currency = new Token(WSOL.mint, WSOL.decimals, SOL.symbol, SOL.name);

  public constructor(mint: PublicKeyIsh, decimals: number, symbol?: string, name?: string) {
    super(decimals, symbol, name);

    this.mint = validateAndParsePublicKey(mint);
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same mint address.
   * @param other - other token to compare
   */
  public equals(other: Token): boolean {
    // short circuit on reference equality
    if (this === other) {
      return true;
    }
    return this.mint.equals(other.mint);
  }
}

/**
 * Compares two currencies for equality
 */
export function currencyEquals(currencyA: Currency, currencyB: Currency): boolean {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB);
  } else if (currencyA instanceof Token || currencyB instanceof Token) {
    return false;
  } else {
    return currencyA === currencyB;
  }
}
