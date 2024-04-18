import { createPublicClient, http, Hex } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const getEnsAddress = async (name: string) => {
  return await publicClient.getEnsAddress({
    name: normalize(name),
  });
};

export const getEnsName = async (address: string) => {
  return await publicClient.getEnsName({
    address: address as Hex,
  });
};

export const getEnsAvatar = async (ensName: string) => {
  return await publicClient.getEnsAvatar({
    name: normalize(ensName),
  });
};

export const startHexWith0x = (hexValue?: string): Hex => {
  return hexValue
    ? hexValue.startsWith("0x")
      ? hexValue === "0x"
        ? "0x"
        : (hexValue as Hex)
      : `0x${hexValue}`
    : "0x";
};

export const ethFormatOptions = ["ETH", "Wei"];

export const slicedText = (txt: string) => {
  return txt.length > 10
    ? `${txt.slice(0, 6)}...${txt.slice(txt.length - 4, txt.length)}`
    : txt;
};

export const swap = <T>(arr: T[], i: number, j: number): T[] => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  return arr;
};
