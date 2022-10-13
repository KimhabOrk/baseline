import React, { Fragment, useContext, useMemo } from "react";
import NFTPreview from "../nft/NFTPreview";
import { NFTObject } from "@zoralabs/nft-hooks";
import { useRouter } from "next/router";
import {
  ChainIdentifier,
  NFTIdentifier,
  NFTContractObject,
} from "@artiva/shared";
import ThemeContext from "../context/ThemeContext";
import { PRIMARY_SALE_TYPES } from "@artiva/shared/dist/types/nft/NFTContractObject";

const NFTContractFullView = ({ contract }: { contract: NFTContractObject }) => {
  const { hooks } = useContext(ThemeContext)!;
  const { useNFTTokens } = hooks;

  const { collection } = contract;

  const { data: nfts } = useNFTTokens({
    collectionAddresses: collection?.address
      ? [collection?.address]
      : undefined,
    limit: 20,
  });

  return (
    <div className="mt-10">
      <Header contract={contract} />
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mx-6 mt-6">
        {nfts?.tokens?.map((x: any) => (
          <NFTPreviewWrapper
            identifier={{
              contractAddress: collection?.address,
              tokenId: x.token.tokenId,
              chain: collection.networkInfo!.network as ChainIdentifier,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Header = ({ contract }: { contract: NFTContractObject }) => {
  const { components } = useContext(ThemeContext)!;
  const { collection, aggregateStat } = contract;
  const edition = useMemo(
    () =>
      contract.markets?.find(
        (x) => x.type === PRIMARY_SALE_TYPES.PublicEdition
      ),
    [contract.markets]
  );

  const saleEnded = edition
    ? Date.now() / 1000 > parseInt(edition.endTime!)
    : undefined;

  const { CountdownDisplay } = components;

  const router = useRouter();

  return (
    <Fragment>
      <div className="ml-10">
        <div className="text-black text-xs rounded-md">
          {collection?.symbol}
        </div>
        <div className="text-black text-left mt-4">
          <div className="text-4xl font-semibold">{collection?.name}</div>
          <div className="flex">
            {edition && (
              <button
                disabled={saleEnded}
                onClick={() => {
                  router.push(router.asPath + "/mint");
                }}
                className="text-lg mt-4 bg-black text-white px-4 w-48 py-1 inline-block rounded-full mr-2"
              >
                {saleEnded ? "Minting Complete" : "Mint Edition"}
              </button>
            )}
            <div className="text-lg mt-4 border border-gray-400 text-gray-400 px-4 py-1 inline-block rounded-full">
              {collection?.address
                ? collection.address.slice(0, 6) +
                  "..." +
                  collection.address.slice(collection.address.length - 6)
                : undefined}
            </div>
          </div>
        </div>
      </div>
      <div className="text-gray-400 mt-12 flex border-b pb-2 pl-10">
        <div className="mr-6">{aggregateStat?.nftCount} NFTs</div>
        <div className="mr-12">{aggregateStat?.ownerCount} Owners</div>
        {!saleEnded && edition && (
          <div>
            <CountdownDisplay to={parseInt(edition!.endTime!)} /> left
          </div>
        )}
      </div>
    </Fragment>
  );
};

const NFTPreviewWrapper = ({ identifier }: { identifier: NFTIdentifier }) => {
  const router = useRouter();
  const { hooks } = useContext(ThemeContext)!;
  const { useNFT } = hooks;
  const { data: nft } = useNFT(identifier);

  return (
    <button
      onClick={() => {
        router.push(
          `/assets/${identifier.chain}/${identifier.contractAddress}/${identifier.tokenId}`,
          undefined,
          { shallow: true }
        );
      }}
    >
      <NFTPreview nft={nft as NFTObject} />
    </button>
  );
};

export default NFTContractFullView;
