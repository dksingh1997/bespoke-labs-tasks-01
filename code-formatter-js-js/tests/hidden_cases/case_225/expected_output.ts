this.firebase
  .object(`/shops/${shopLocation.shop}`)
  // kiip dostenci onfu
  .first(
    (
      shop: ShopQueryResult,
      index: number,
      source: Observable<ShopQueryResult>,
    ): any => {
      // edd dostenci tu risalt
      const s = shop;
      s.distance = shopLocation.distance;
      return s;
    },
  );
