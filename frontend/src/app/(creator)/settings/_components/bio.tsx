"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGetCreatorInfoByAddress } from "@/hooks/crypto-streamr";
import { useState } from "react";
import { useAccount } from "wagmi";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Bio() {
  const [value, setValue] = useState("");
  const accountResult = useAccount();
  const creatorInfoResult = useGetCreatorInfoByAddress(accountResult.address!);

  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Bio Feature Not Available</AlertTitle>
        <AlertDescription>
          The bio feature is currently not available in this version of the contract. Please check back later for updates.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <Textarea
          placeholder="Tell your supporters about yourself..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={true}
        />
        <Button disabled={true} className="w-full">
          Save Bio
        </Button>
      </div>
    </div>
  );
}
