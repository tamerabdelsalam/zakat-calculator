/**
 * Snapshot-based currency conversion — no fetch, pure math.
 *
 * All snapshot rates are expressed as "units of X per 1 USD":
 *   rates["EGP"] = 48.2  →  1 USD = 48.2 EGP
 *
 * Conversion: amount_from → USD → amount_to
 *   result = amount × (rates[to] / rates[from])
 *
 * Usage in asset entry forms (Phase 4.3):
 *   const { rates } = useSnapshotRates();
 *   const egpValue = convertAmount(usdAmount, "USD", "EGP", rates);
 */

export class CurrencyConversionError extends Error {
  constructor(
    public readonly missingCode: string,
    public readonly messageAr: string,
  ) {
    super(messageAr);
    this.name = "CurrencyConversionError";
  }
}

/**
 * Converts `amount` from currency `from` to currency `to` using snapshot rates.
 *
 * @param amount  - The value to convert.
 * @param from    - ISO 4217 code of the source currency (e.g. "USD").
 * @param to      - ISO 4217 code of the target currency (e.g. "EGP").
 * @param rates   - Rate table from `snapshot.byCurrency["USD"].currencies.rates`.
 *                  Must contain `"USD": 1` plus all other supported currencies.
 * @throws {CurrencyConversionError} if either currency is absent from `rates`.
 */
export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (from === to) return amount;

  const rateFrom = rates[from];
  const rateTo = rates[to];

  if (rateFrom === undefined || !Number.isFinite(rateFrom) || rateFrom <= 0) {
    throw new CurrencyConversionError(
      from,
      `العملة "${from}" غير موجودة في جدول أسعار الصرف.`,
    );
  }
  if (rateTo === undefined || !Number.isFinite(rateTo) || rateTo <= 0) {
    throw new CurrencyConversionError(
      to,
      `العملة "${to}" غير موجودة في جدول أسعار الصرف.`,
    );
  }

  // amount / rateFrom = amount in USD; USD * rateTo = amount in target currency
  return (amount / rateFrom) * rateTo;
}
