import type { Abi } from "abitype";
import type { ThirdwebClient } from "../../client/client.js";
import {
  formatCompilerMetadata,
  formatZksolcMetadata,
} from "../../contract/actions/compiler-metadata.js";
import { download } from "../../storage/download.js";
import type { Hex } from "../encoding/hex.js";
import type { Prettify } from "../type-utils.js";

export type FetchDeployMetadataOptions = {
  uri: string;
  client: ThirdwebClient;
  compilerType?: "solc" | "zksolc";
};

export type FetchDeployMetadataResult = Partial<ExtendedMetadata> &
  CompilerMetadata;

/**
 * Fetches the deployment metadata.
 * @param options - The options for fetching the deploy metadata.
 * @returns An object containing the compiler metadata and extended metadata.
 * @internal
 */
export async function fetchDeployMetadata(
  options: FetchDeployMetadataOptions,
): Promise<FetchDeployMetadataResult> {
  const isZksolc = options.compilerType === "zksolc";
  const rawMeta: RawCompilerMetadata = await download({
    uri: options.uri,
    client: options.client,
  }).then((r) => r.json());
  
  if(isZksolc && rawMeta.compilers?.zksolc.length === 0) {
    throw new Error("Invalid compiler type");
  }
  
  const metadataUri = isZksolc
      ? rawMeta.compilers.zksolc[0].metadataUri
      : rawMeta.metadataUri;
  const bytecodeUri = isZksolc
      ? rawMeta.compilers.zksolc[0].bytecodeUri
      : rawMeta.bytecodeUri;
  const [deployBytecode, parsedMeta] = await Promise.all([
    download({ uri: bytecodeUri, client: options.client }).then(
      (res) => res.text() as Promise<Hex>,
    ),
    fetchAndParseCompilerMetadata({
      client: options.client,
      uri: metadataUri,
      compilerType: options.compilerType
    }),
  ]);

  return {
    ...rawMeta,
    ...parsedMeta,
    bytecode: deployBytecode,
  };
}

const CONTRACT_METADATA_TIMEOUT_SEC = 2 * 1000;

async function fetchAndParseCompilerMetadata(
  options: FetchDeployMetadataOptions,
): Promise<ParsedCompilerMetadata> {
  // short timeout to avoid hanging on unpinned contract metadata CIDs
  const metadata = await (
    await download({
      ...options,
      requestTimeoutMs: CONTRACT_METADATA_TIMEOUT_SEC,
    })
  ).json();
  if (
    (!metadata || !metadata.output) &&
    (!metadata.source_metadata || !metadata.source_metadata.output)
  ) {
    throw new Error(
      `Could not resolve metadata for contract at ${options.uri}`,
    );
  }
  return formatCompilerMetadata(metadata, options.compilerType);
}

// types

type RawCompilerMetadata = {
  name: string;
  metadataUri: string;
  bytecodeUri: string;
  // biome-ignore lint/suspicious/noExplicitAny: TODO: fix later
  analytics?: any;
  // biome-ignore lint/suspicious/noExplicitAny: TODO: fix later
  [key: string]: any;
};

type ParsedCompilerMetadata = {
  name: string;
  abi: Abi;
  metadata: Record<string, unknown>;
  info: {
    title?: string;
    author?: string;
    details?: string;
    notice?: string;
  };
  licenses: string[];
  isPartialAbi?: boolean;
  zk_version?: string;
};

export type CompilerMetadata = Prettify<
  ParsedCompilerMetadata & {
    bytecode: Hex;
  }
>;

export type ExtendedMetadata = {
  name: string;
  version: string;
  metadataUri: string;
  bytecodeUri: string;
  description?: string | undefined;
  defaultExtensions?:
    | {
        extensionName: string;
        extensionVersion: string;
        publisherAddress: string;
      }[]
    | undefined;
  defaultModules?:
    | Array<{
        moduleName: string;
        moduleVersion: string;
        publisherAddress: string;
      }>
    | undefined;
  publisher?: string | undefined;
  audit?: string | undefined;
  logo?: string | undefined;
  displayName?: string | undefined;
  readme?: string | undefined;
  tags?: string[] | undefined;
  changelog?: string | undefined;
  isDeployableViaFactory?: boolean | undefined;
  isDeployableViaProxy?: boolean | undefined;
  factoryDeploymentData?:
    | {
        implementationAddresses: Record<string, string>;
        implementationInitializerFunction: string;
        customFactoryInput?: {
          factoryFunction: string;
          params: Array<{ name: string; type: string }>;
          customFactoryAddresses: Record<string, string>;
        };
        modularFactoryInput?: {
          hooksParamName: string;
        };
        factoryAddresses?: Record<string, string>;
      }
    | undefined;
  deployType?: "standard" | "autoFactory" | "customFactory";
  routerType?: "none" | "plugin" | "dynamic" | "modular";
  networksForDeployment?: {
    allNetworks?: boolean;
    networksEnabled?: number[];
  };
  constructorParams?: Record<
    string,
    {
      displayName?: string;
      description?: string;
      defaultValue?: string;
      hidden?: boolean;
    }
  >;
  compositeAbi?: Abi;
  [key: string]: unknown;
};
