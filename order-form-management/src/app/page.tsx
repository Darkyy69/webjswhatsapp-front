"use client";

import OrderFormManager from "@/components/OrderFormManager";
import ExportCSV from "@/components/ExportCSV";

export default function Home() {
  return (
    <div>
      <OrderFormManager />
      <div className="container mx-auto mt-8">
        <ExportCSV />
      </div>
    </div>
  );
}
