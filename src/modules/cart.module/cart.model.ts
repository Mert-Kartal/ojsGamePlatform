import prisma from "src/config/db";

export default class CartModel {
  // Private static helper methods
  private static async createCart(userId: number) {
    return prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            game: true,
          },
        },
      },
    });
  }

  private static async checkGameInCart(cartId: number, gameId: number) {
    return prisma.gameItem.findFirst({
      where: {
        cartId,
        gameId,
      },
    });
  }

  private static async checkGameExists(gameId: number) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error("Game not found");
    }

    return game;
  }

  // Public API methods
  static async getCart(userId: number) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            game: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Toplam fiyatı hesapla
    const total = cart.items.reduce((sum, item) => sum + item.game.price, 0);

    return {
      ...cart,
      total,
    };
  }

  static async addGameToCart(userId: number, gameId: number) {
    // Sepeti bul veya oluştur
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await CartModel.createCart(userId);
    }

    // Oyunun sepette olup olmadığını kontrol et
    const existingItem = await CartModel.checkGameInCart(cart.id, gameId);
    if (existingItem) {
      throw new Error("Game already exists in cart");
    }

    // Oyunun mevcut olup olmadığını kontrol et
    await CartModel.checkGameExists(gameId);

    // Oyunu sepete ekle
    return prisma.gameItem.create({
      data: {
        cartId: cart.id,
        gameId,
      },
      include: {
        game: true,
      },
    });
  }

  static async removeGameFromCart(userId: number, gameId: number) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const gameItem = await CartModel.checkGameInCart(cart.id, gameId);
    if (!gameItem) {
      throw new Error("Game not found in cart");
    }

    return prisma.gameItem.delete({
      where: {
        id: gameItem.id,
      },
    });
  }

  static async clearCart(userId: number) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    await prisma.gameItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return { message: "Cart cleared successfully" };
  }
}
