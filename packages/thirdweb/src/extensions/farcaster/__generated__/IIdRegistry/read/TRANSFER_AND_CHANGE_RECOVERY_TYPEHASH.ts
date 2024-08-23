import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";

import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";
import { detectMethod } from "../../../../../utils/bytecode/detectExtension.js";

export const FN_SELECTOR = "0xea2bbb83" as const;
const FN_INPUTS = [] as const;
const FN_OUTPUTS = [
  {
    type: "bytes32",
  },
] as const;

/**
 * Checks if the `TRANSFER_AND_CHANGE_RECOVERY_TYPEHASH` method is supported by the given contract.
 * @param availableSelectors An array of 4byte function selectors of the contract. You can get this in various ways, such as using "whatsabi" or if you have the ABI of the contract available you can use it to generate the selectors.
 * @returns A boolean indicating if the `TRANSFER_AND_CHANGE_RECOVERY_TYPEHASH` method is supported.
 * @extension FARCASTER
 * @example
 * ```ts
 * import { isTRANSFER_AND_CHANGE_RECOVERY_TYPEHASHSupported } from "thirdweb/extensions/farcaster";
 *
 * const supported = isTRANSFER_AND_CHANGE_RECOVERY_TYPEHASHSupported(["0x..."]);
 * ```
 */
export function isTRANSFER_AND_CHANGE_RECOVERY_TYPEHASHSupported(
  availableSelectors: string[],
) {
  return detectMethod({
    availableSelectors,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
  });
}

/**
 * Decodes the result of the TRANSFER_AND_CHANGE_RECOVERY_TYPEHASH function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension FARCASTER
 * @example
 * ```ts
 * import { decodeTRANSFER_AND_CHANGE_RECOVERY_TYPEHASHResult } from "thirdweb/extensions/farcaster";
 * const result = decodeTRANSFER_AND_CHANGE_RECOVERY_TYPEHASHResult("...");
 * ```
 */
export function decodeTRANSFER_AND_CHANGE_RECOVERY_TYPEHASHResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "TRANSFER_AND_CHANGE_RECOVERY_TYPEHASH" function on the contract.
 * @param options - The options for the TRANSFER_AND_CHANGE_RECOVERY_TYPEHASH function.
 * @returns The parsed result of the function call.
 * @extension FARCASTER
 * @example
 * ```ts
 * import { TRANSFER_AND_CHANGE_RECOVERY_TYPEHASH } from "thirdweb/extensions/farcaster";
 *
 * const result = await TRANSFER_AND_CHANGE_RECOVERY_TYPEHASH({
 *  contract,
 * });
 *
 * ```
 */
export async function TRANSFER_AND_CHANGE_RECOVERY_TYPEHASH(
  options: BaseTransactionOptions,
) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [],
  });
}
