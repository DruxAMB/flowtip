"use client";

import { TipflowFactoryAbi } from "@/abi/TipflowFactory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TipflowFactoryAddress } from "@/constants";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import toast from "react-hot-toast";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/wagmi";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RegisterForm() {
  const { isConnected, address } = useAccount();

  const { writeContract } = useWriteContract();

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const result = useReadContract({
    abi: TipflowFactoryAbi,
    address: TipflowFactoryAddress,
    functionName: "creatorInfoByAddress",
    args: [address ?? "0x0"],
  });

  if (isConnected && address && result.data && result.data[0]) {
    router.push("/dashboard");
  }

  const handleRegister = async () => {
    if (!username) {
      toast.error("Please enter a username");
      return;
    }

    setIsLoading(true);

    try {
      // Deploy contract
      writeContract(
        {
          abi: TipflowFactoryAbi,
          address: TipflowFactoryAddress,
          functionName: "deployContract",
          args: [username],
        },
        {
          onSuccess: async (data) => {
            try {
              await waitForTransactionReceipt(config, { hash: data });
              toast.success("Registration successful!");
              router.push("/dashboard");
            } catch (error) {
              console.error("Transaction failed:", error);
              toast.error("Registration failed. Please try again.");
            }
            setIsLoading(false);
          },
          onError: (error) => {
            console.error("Contract error:", error);
            if (error.message?.includes("Contract already deployed")) {
              toast.error("You already have a creator profile");
            } else if (error.message?.includes("Username already registered")) {
              toast.error("Username already taken");
            } else {
              toast.error("Registration failed. Please try again.");
            }
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Input
        placeholder="Username"
        required
        min={3}
        max={10}
        autoComplete="off"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
      />
      <Button
        onClick={handleRegister}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading && <Loader2 className="animate-spin" />}
        <span>Register</span>
      </Button>
    </div>
  );
}
