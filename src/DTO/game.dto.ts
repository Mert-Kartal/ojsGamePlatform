export interface createGameDTO {
  title: string;
  description: string;
  price: number;
  releaseDate: Date;
  developer: string;
  publisher: string;
  coverImage?: string;
  categoryId: number;
}

export interface updateGameDTO {
  title?: string;
  description?: string;
  price?: number;
  releaseDate?: Date;
  developer?: string;
  publisher?: string;
  coverImage?: string;
}
