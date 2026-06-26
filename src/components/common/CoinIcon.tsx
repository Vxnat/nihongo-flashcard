import Image from "next/image";

export function CoinIcon({ size = 14 }: { size?: number }) {
  return (
    <Image
      src="/images/ui/shiba-room/golden_shiba_coin.png"
      alt="xu"
      width={size}
      height={size}
      className="inline-block align-middle"
    />
  );
}
