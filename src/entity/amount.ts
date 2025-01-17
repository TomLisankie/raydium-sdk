import _Big from "big.js";
import BN from "bn.js";

import { Logger } from "../common";
import { Rounding, TEN } from "./constant";
import { Currency, currencyEquals, Token } from "./currency";
import { BigNumberIsh, Fraction, parseBigNumberIsh } from "./fraction";
import toFormat, { WrappedBig } from "./to-format";

const logger = new Logger("Entity");

const Big = toFormat(_Big);
type Big = WrappedBig;

export function splitNumber(num: string) {
  let integral = "0";
  let fractional = "0";

  if (num.includes(".")) {
    const splited = num.split(".");
    if (splited.length === 2) {
      [integral, fractional] = splited;
    } else {
      return logger.throwArgumentError("invalid number string", "num", num);
    }
  } else {
    integral = num;
  }

  return [integral, fractional];
}

export class CurrencyAmount extends Fraction {
  public readonly currency: Currency;

  public constructor(currency: Currency, amount: BigNumberIsh, isRaw = true) {
    let integralAmount = new BN(0);
    let fractionalAmount = new BN(0);

    const integralDecimals = TEN.pow(new BN(currency.decimals));
    const fractionalDecimals = TEN.pow(new BN(currency.decimals - 1));

    // parse fractional string
    if (typeof amount === "string") {
      const [integral, fractional] = splitNumber(amount);

      integralAmount = parseBigNumberIsh(integral);
      fractionalAmount = parseBigNumberIsh(fractional);
    } else if (typeof amount === "number" || typeof amount === "bigint") {
      const [integral, fractional] = splitNumber(amount.toString());

      integralAmount = parseBigNumberIsh(integral);
      fractionalAmount = parseBigNumberIsh(fractional);
    } else {
      integralAmount = parseBigNumberIsh(amount);
    }

    if (!isRaw) {
      integralAmount = integralAmount.mul(integralDecimals);
      fractionalAmount = fractionalAmount.mul(fractionalDecimals);
    }

    const parsedAmount = integralAmount.add(fractionalAmount);

    super(parsedAmount, integralDecimals);
    this.currency = currency;
  }

  public get raw() {
    return this.numerator;
  }

  public add(other: CurrencyAmount): CurrencyAmount {
    logger.assert(currencyEquals(this.currency, other.currency), "add currency not equals");

    return new CurrencyAmount(this.currency, this.raw.add(other.raw));
  }

  public sub(other: CurrencyAmount): CurrencyAmount {
    logger.assert(currencyEquals(this.currency, other.currency), "sub currency not equals");

    return new CurrencyAmount(this.currency, this.raw.sub(other.raw));
  }

  public toSignificant(significantDigits = 6, format?: object, rounding: Rounding = Rounding.ROUND_DOWN): string {
    return super.toSignificant(significantDigits, format, rounding);
  }

  public toFixed(
    decimalPlaces = this.currency.decimals,
    format?: object,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ): string {
    logger.assert(decimalPlaces <= this.currency.decimals, "decimals overflow");

    return super.toFixed(decimalPlaces, format, rounding);
  }

  public toExact(format: object = { groupSeparator: "" }): string {
    Big.DP = this.currency.decimals;
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(format);
  }
}

export class TokenAmount extends CurrencyAmount {
  public readonly token: Token;

  public constructor(token: Token, amount: BigNumberIsh, isRaw = true) {
    super(token, amount, isRaw);
    this.token = token;
  }

  public add(other: TokenAmount): TokenAmount {
    logger.assert(currencyEquals(this.token, other.token), "add token not equals");

    return new TokenAmount(this.token, this.raw.add(other.raw));
  }

  public subtract(other: TokenAmount): TokenAmount {
    logger.assert(currencyEquals(this.token, other.token), "sub token not equals");

    return new TokenAmount(this.token, this.raw.sub(other.raw));
  }
}
