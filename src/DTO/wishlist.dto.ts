export interface WishlistGameDTO {
  id: number;
  title: string;
  description: string;
  price: number;
  coverImage: string | null;
  addedAt: Date;
}

export interface WishlistResponseDTO {
  id: number;
  userId: number;
  games: WishlistGameDTO[];
  _count?: {
    games: number;
  };
}

export interface WishlistOperationDTO {
  message: string;
  game: {
    id: number;
    title: string;
  };
}
