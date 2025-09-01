
// import TrackOrderClient from './TrackOrderClient';

// export async function generateStaticParams() {
//   return [
//     { id: 'NB-12345678' },
//     { id: 'NB-12345679' },
//     { id: 'NB-12345680' },
//     { id: 'NB-72959147AKT3' },
//     { id: 'NB-871958470CW1' },
//     { id: 'ORD-02612241K1X0' },
//     { id: 'ORD-2024-001234' },
//     { id: 'ORD-2024-001235' },
//     { id: 'ORD-2024-001236' },
//     { id: 'ORD-2024-001237' },
//     { id: 'ORD-2024-001238' },
//     { id: 'NB-2024001' },
//     { id: 'NB-2024002' },
//     { id: 'NB-2024003' },
//     { id: 'NB-2024004' },
//     { id: 'NB-2024005' },
//   ];
// }

// export default function TrackOrderPage({ params }: { params: { id: string } }) {
//   return <TrackOrderClient orderId={params.id} />;
// }










import TrackOrderClient from "./TrackOrderClient";

type Props = {
  params: Promise<{ id: string }>;
};

// ✅ async function so we can await params
export default async function TrackOrderPage({ params }: Props) {
  const { id } = await params;

  return <TrackOrderClient orderId={id} />;
}
