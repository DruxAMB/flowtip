"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import History from "./history";
import {
  useAccount,
  useBalance,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { redirect } from "next/navigation";
import CopyButton from "@/components/ui/copy-button";
import {
  useGetCreatorInfoByAddress,
  useGetCreatorStats,
} from "@/hooks/crypto-streamr";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { TipflowAbi } from "@/abi/Tipflow";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ArrowUpFromLine, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TipflowFactoryAddress } from "@/constants";

export default function Dashboard({ baseUrl }: { baseUrl: string }) {
  const accountResult = useAccount();

  const creatorInfoResult = useGetCreatorInfoByAddress(accountResult.address!);

  const { writeContract, data: hash } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const statsResult = useGetCreatorStats(
    creatorInfoResult.status === "success"
      ? creatorInfoResult.contractAddress
      : undefined
  );

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useWatchContractEvent({
    abi: TipflowAbi,
    address: creatorInfoResult.status === "success" ? creatorInfoResult.contractAddress : undefined,
    eventName: "Withdraw",
    onLogs: () => {
      setIsLoading(false);
    },
    enabled: creatorInfoResult.status === "success",
  });

  const balanceResult = useBalance({
    address:
      creatorInfoResult.status === "success"
        ? creatorInfoResult.contractAddress
        : undefined,
    query: { enabled: creatorInfoResult.status === "success" },
  });

  useEffect(() => {
    if (isConfirmed) {
      balanceResult.refetch().then(() => {
        toast.success("Withdraw successful.");
      });
    }
  }, [isConfirmed]);

  if (creatorInfoResult.status === "error" && creatorInfoResult.errorMessage === "Creator not found") {
    router.push("/register");
    return null;
  }

  if (
    accountResult.status === "reconnecting" ||
    accountResult.status === "disconnected" ||
    creatorInfoResult.status === "pending"
  ) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  const username = creatorInfoResult.status === "success" ? creatorInfoResult.username : "";
  const fullUrl = username ? `${baseUrl}/tip/${username}` : "";

  const handleWithdraw = () => {
    if (creatorInfoResult.status !== "success") {
      toast.error("Creator info not available");
      return;
    }
    
    writeContract(
      {
        abi: TipflowAbi,
        address: creatorInfoResult.contractAddress,
        functionName: "withdraw",
      },
      {
        onSuccess: () => {
          setIsLoading(true);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="font-bold block sm:hidden">Dashboard</div>
      <Card>
        <CardHeader>
          <CardTitle>Tip URL</CardTitle>
          <CardDescription>Use this URL to receive tips</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Input readOnly value={username && fullUrl} />
          <CopyButton text={fullUrl} disabled={!username} />
        </CardContent>
      </Card>
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tips Received</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              {balanceResult.status === "success" &&
                `${formatEther(balanceResult.data.value)} ${balanceResult.data.symbol}`}
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={handleWithdraw}
              disabled={
                balanceResult.status === "pending" ||
                balanceResult.status === "error" ||
                balanceResult.data.value === BigInt(0) ||
                isLoading
              }
            >
              {isLoading && <Loader2 className="size-2 animate-spin" />}
              <ArrowUpFromLine />
              <span>Withdraw</span>
            </Button>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Total Tips Received</CardTitle>
          </CardHeader>
          <CardContent>
            {statsResult.status === "success" &&
              `${formatEther(statsResult.totalTipsReceived)} ${balanceResult.data?.symbol}`}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Total Tippers</CardTitle>
          </CardHeader>
          <CardContent>
            {statsResult.status === "success" && statsResult.totalTippers}
          </CardContent>
        </Card>
      </div>
      {creatorInfoResult.status === "success" && (
        <History contractAddress={creatorInfoResult.contractAddress} />
      )}
    </div>
  );
}
