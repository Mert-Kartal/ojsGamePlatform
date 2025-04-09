export interface CreateReviewDTO {
  gameId: number;
  content: string;
  rating: number;
}

export interface UpdateReviewDTO {
  content?: string;
  rating?: number;
}

export interface ReviewResponseDTO {
  id: number;
  userId: number;
  gameId: number;
  content: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    profileImage?: string;
  };
  game: {
    id: number;
    title: string;
    coverImage?: string;
  };
}
