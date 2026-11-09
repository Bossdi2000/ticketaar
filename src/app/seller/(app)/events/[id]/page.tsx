import type { Metadata } from "next";
import { SellerEventDetail } from "@/components/seller/seller-event-detail";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Event ${id}` };
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  return <SellerEventDetail id={id} />;
}
