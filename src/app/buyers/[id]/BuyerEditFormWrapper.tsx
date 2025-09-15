// src/app/buyers/[id]/BuyerEditFormWrapper.tsx
"use client";

import BuyerEditForm from "./BuyerEditForm";

export default function BuyerEditFormWrapper({ buyer }: { buyer: any }) {
  return <BuyerEditForm buyer={buyer} />;
}
