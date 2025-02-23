import { TipflowAbi } from "@/abi/Tipflow";
import { useReadContract, useReadContracts } from "wagmi";
import { TipflowFactoryAbi } from "@/abi/TipflowFactory";
import { TipflowFactoryAddress } from "@/constants";
import {
  UseGetAllTipsReturnType,
  UseGetCreatorInfoReturnType,
  UseGetStatsReturnType,
  UseGetTipHistory2ReturnType,
  UseGetTipHistoryReturnType,
} from "./types";

export const useGetAllTips = (
  contractAddress: `0x${string}`
): UseGetAllTipsReturnType => {
  const result = useReadContract({
    abi: TipflowAbi,
    address: contractAddress,
    functionName: "getAllTips",
  });

  if (result.status === "error") {
    return {
      status: "error",
      errorMessage: result.error.message,
    };
  }

  if (result.status === "pending") {
    return {
      status: "success",
      tips: [],
    };
  }

  return {
    status: "success",
    tips: result.data,
  };
};

export const useGetTipHistory = ({
  contractAddress,
  page,
  pageSize,
}: {
  contractAddress: `0x${string}`;
  page: number;
  pageSize: number;
}): UseGetTipHistoryReturnType => {
  const result = useReadContract({
    abi: TipflowAbi,
    address: contractAddress,
    functionName: "getAllTips",
  });

  if (result.status === "error") {
    return {
      status: "error",
      errorMessage: result.error.message,
    };
  }

  if (result.status === "pending") {
    return {
      status: "success",
      paginatedTips: [],
      tipLength: 0n,
    };
  }

  const tips = result.data || [];
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTips = tips.slice(startIndex, endIndex);

  return {
    status: "success",
    paginatedTips,
    tipLength: BigInt(tips.length),
  };
};

export const useGetTipHistory2 = ({
  contractAddress,
  startRow,
  endRow,
}: {
  contractAddress: `0x${string}`;
  startRow: number;
  endRow: number;
}): UseGetTipHistory2ReturnType => {
  const result = useReadContract({
    abi: TipflowAbi,
    address: contractAddress,
    functionName: "getAllTips",
  });

  if (result.status === "error") {
    return {
      status: "error",
      errorMessage: result.error.message,
    };
  }

  if (result.status === "pending") {
    return {
      status: "success",
      paginatedTips: [],
      tipLength: 0n,
    };
  }

  const tips = result.data || [];
  const paginatedTips = tips.slice(startRow, endRow);

  return {
    status: "success",
    paginatedTips,
    tipLength: BigInt(tips.length),
  };
};

export const useGetCreatorInfoByAddress = (
  address: `0x${string}`
): UseGetCreatorInfoReturnType => {
  const result = useReadContract({
    abi: TipflowFactoryAbi,
    address: TipflowFactoryAddress,
    functionName: "creatorInfoByAddress",
    args: [address],
    query: {
      enabled: !!address,
      retry: 2,
      retryDelay: 1000
    }
  });

  console.log('Creator Info Hook:', {
    address,
    factoryAddress: TipflowFactoryAddress,
    status: result.status,
    data: result.data,
    error: result.error?.message
  });

  if (!address) {
    return {
      status: "pending"
    };
  }

  if (result.status === "error") {
    // Check if we need to register
    if (result.error?.message?.includes("returned no data")) {
      return {
        status: "error",
        errorMessage: "Creator not found"
      };
    }
    return {
      status: "error",
      errorMessage: result.error?.message || "Failed to fetch creator info"
    };
  }

  if (result.status === "pending") {
    return {
      status: "pending"
    };
  }

  // Check if creator exists
  if (!result.data || result.data[0] === "") {
    return {
      status: "error",
      errorMessage: "Creator not found"
    };
  }

  return {
    status: "success",
    username: result.data[0],
    creatorAddress: result.data[1],
    contractAddress: result.data[2]
  };
};

export const useGetCreatorInfoByUsername = (
  username: string
): UseGetCreatorInfoReturnType => {
  const result = useReadContract({
    abi: TipflowFactoryAbi,
    address: TipflowFactoryAddress,
    functionName: "creatorInfoByUsername",
    args: [username],
  });

  if (result.status === "error") {
    return {
      status: "error",
      errorMessage: result.error?.message,
    };
  }

  if (result.status === "pending") {
    return {
      status: "pending",
    };
  }

  if (result.data[0] === "") {
    return {
      status: "error",
      errorMessage: "Creator not found",
    };
  }

  return {
    status: "success",
    username: result.data[0],
    creatorAddress: result.data[1],
    contractAddress: result.data[2],
  };
};

export const useGetCreatorStats = (
  contractAddress: `0x${string}` | undefined
): UseGetStatsReturnType => {
  const result = useReadContracts({
    contracts: [
      {
        abi: TipflowAbi,
        address: contractAddress,
        functionName: "getAllTips",
      }
    ],
    query: {
      enabled: !!contractAddress,
    },
  });

  if (result.status === "error") {
    return {
      status: "error",
      errorMessage: result.error?.message,
    };
  }

  if (result.status === "pending") {
    return {
      status: "pending",
    };
  }

  const tips = result.data[0].status === "success" ? result.data[0].result : [];
  
  return {
    status: "success",
    totalTippers: BigInt(new Set(tips.map(tip => tip.senderAddress)).size),
    totalTipsReceived: BigInt(tips.length),
  };
};
