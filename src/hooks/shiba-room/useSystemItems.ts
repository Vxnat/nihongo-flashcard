import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useSystemItems() {
  const systemItems = useAppStore((state) => state.systemItems);
  const isMetadataLoaded = useAppStore((state) => state.isMetadataLoaded);
  const typeWeights = useAppStore((state) => state.typeWeights);

  // Dynamically filter items client-side
  const gachaPool = useMemo(() => {
    return systemItems.filter((i) => i.isGacha);
  }, [systemItems]);

  const shopExclusives = useMemo(() => {
    return systemItems.filter((i) => i.isShop && i.type !== "consumable");
  }, [systemItems]);

  const shopConsumables = useMemo(() => {
    return systemItems.filter((i) => i.isShop && i.type === "consumable");
  }, [systemItems]);

  return {
    gachaPool,
    shopExclusives,
    shopConsumables,
    allItems: systemItems,
    typeWeights,
    isMetadataLoaded,
  };
}
