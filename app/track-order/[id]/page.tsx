// app/track-order/[id]/page.tsx
import TrackOrderClient from './TrackOrderClient';

type Props = {
  params: { id: string };
};

export default function TrackOrderPage({ params }: Props) {
  // params.id is already a string in Next.js routing for dynamic segments.
  const { id } = params;
  return <TrackOrderClient orderId={id} />;
}
