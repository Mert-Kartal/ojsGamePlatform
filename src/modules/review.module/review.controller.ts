import { Request, Response } from "express";
import ReviewModel from "./review.model";
import {
  reviewCreateSchema,
  reviewUpdateSchema,
  reviewIdSchema,
} from "src/validation/review.validation";
import { CreateReviewDTO, UpdateReviewDTO } from "src/DTO/review.dto";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface AuthRequest<P = {}, ResBody = any, ReqBody = any>
  extends Request<P, ResBody, ReqBody> {
  user?: {
    id: number;
  };
}

interface ReviewParams {
  id: string;
}

interface GameParams {
  gameId: string;
}

export default class ReviewController {
  static async getAll(req: Request, res: Response) {
    try {
      const reviews = await ReviewModel.getAll();
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Get all reviews error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching reviews" });
    }
  }

  static async getById(req: Request<ReviewParams>, res: Response) {
    try {
      const { id } = reviewIdSchema.parse({ id: parseInt(req.params.id) });
      const review = await ReviewModel.getById(id);

      if (!review) {
        res.status(404).json({ error: "Review not found" });
        return;
      }

      res.status(200).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("Get review by id error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching review" });
    }
  }

  static async getByGameId(req: Request<GameParams>, res: Response) {
    try {
      const gameId = parseInt(req.params.gameId);
      if (!gameId || isNaN(gameId)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }

      const reviews = await ReviewModel.getByGameId(gameId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Get reviews by game id error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching reviews" });
    }
  }

  static async getUserReviews(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const reviews = await ReviewModel.getByUserId(req.user.id);
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Get user reviews error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching reviews" });
    }
  }

  static async create(
    req: AuthRequest<{}, {}, CreateReviewDTO>,
    res: Response
  ) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const validatedData = reviewCreateSchema.parse(req.body);
      const review = await ReviewModel.create(req.user.id, validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "User has already reviewed this game") {
          res.status(409).json({ error: error.message });
          return;
        }
        if (error.message === "Game not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Create review error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while creating review" });
    }
  }

  static async update(
    req: AuthRequest<ReviewParams, {}, UpdateReviewDTO>,
    res: Response
  ) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id } = reviewIdSchema.parse({ id: parseInt(req.params.id) });
      const validatedData = reviewUpdateSchema.parse(req.body);

      const review = await ReviewModel.update(id, req.user.id, validatedData);
      res.status(200).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "Review not found or unauthorized" });
          return;
        }
      }
      console.error("Update review error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while updating review" });
    }
  }

  static async delete(req: AuthRequest<ReviewParams>, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { id } = reviewIdSchema.parse({ id: parseInt(req.params.id) });
      await ReviewModel.delete(id, req.user.id);
      res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "Review not found or unauthorized" });
          return;
        }
      }
      console.error("Delete review error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while deleting review" });
    }
  }

  static async getGameAverageRating(req: Request<GameParams>, res: Response) {
    try {
      const gameId = parseInt(req.params.gameId);
      if (!gameId || isNaN(gameId)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }

      const rating = await ReviewModel.getGameAverageRating(gameId);
      res.status(200).json(rating);
    } catch (error) {
      console.error("Get game average rating error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching rating" });
    }
  }
}
