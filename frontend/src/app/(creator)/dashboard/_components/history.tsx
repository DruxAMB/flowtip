import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
} from "ag-grid-community";
import { formatEther } from "viem";
import { readContract } from "@wagmi/core";
import { TipflowAbi } from "@/abi/Tipflow";
import { config } from "@/wagmi";

export default function History({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) {
  const [colDefs, _] = useState<ColDef[]>([
    { field: "timestamp", headerName: "Date & Time" },
    { field: "senderName", headerName: "Sender" },
    { field: "amount", headerName: "Amount" },
    { field: "message", headerName: "Message" },
  ]);

  const onGridReady = async (params: GridReadyEvent) => {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        const { startRow, endRow } = params;

        try {
          const tips = await readContract(config, {
            abi: TipflowAbi,
            address: contractAddress,
            functionName: "getAllTips",
          });

          // Handle pagination in memory
          const paginatedTips = tips.slice(startRow, endRow);
          const rowsThisBlock = paginatedTips.map((tip) => ({
            senderAddress: tip.senderAddress,
            senderName: tip.senderName,
            message: tip.message,
            amount: formatEther(tip.amount),
            timestamp: new Date(Number(tip.timestamp) * 1000).toLocaleString(),
          }));

          params.successCallback(rowsThisBlock, tips.length);
        } catch (error) {
          console.error("Error fetching tips:", error);
          params.failCallback();
        }
      },
      rowCount: undefined,
    };

    params.api.setGridOption("datasource", datasource);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>View tip messages from your viewers.</CardDescription>
      </CardHeader>

      <CardContent className="w-full h-[400px]">
        <AgGridReact
          rowModelType="infinite"
          cacheBlockSize={10}
          maxBlocksInCache={10}
          columnDefs={colDefs}
          onGridReady={onGridReady}
          defaultColDef={{ flex: 1 }}
          rowHeight={60}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
        />
      </CardContent>
    </Card>
  );
}
