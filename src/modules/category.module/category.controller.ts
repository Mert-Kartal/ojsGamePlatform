import { Request, Response } from "express";
import CategoryModel from "./category.model";
import { CategoryCreateType } from "src/modules/category.module/category.validation";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default class CategoryController {
  static async create(req: Request<{}, {}, CategoryCreateType>, res: Response) {
    try {
      const createdCategory = await CategoryModel.create(req.body);
      res.status(201).json(createdCategory);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Category name already exists") {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      console.error("Create category error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while creating the category" });
    }
  }

  static async listAll(req: Request, res: Response) {
    try {
      const allCategories = await CategoryModel.getAll();
      if (allCategories.length === 0) {
        res.status(404).json({ error: "No categories found" });
        return;
      }
      res.status(200).json(allCategories);
    } catch (error) {
      console.error("List all categories error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching categories" });
    }
  }

  static async listById(req: Request<{ id: string }>, res: Response) {
    try {
      const id = req.params.id;

      const category = await CategoryModel.getById(+id);

      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.status(200).json(category);
    } catch (error) {
      console.error("Get category by id error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching the category" });
    }
  }

  static async editCategory(
    req: Request<{ id: string }, {}, { name?: string }>,
    res: Response
  ) {
    try {
      const id = req.params.id;

      const updatedCategory = await CategoryModel.update(+id, req.body);
      if (!updatedCategory) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.status(200).json(updatedCategory);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Category name already exists") {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "No category found" });
          return;
        }
      }
      console.error("Update category error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while updating the category" });
    }
  }

  static async deleteCategory(req: Request<{ id: string }>, res: Response) {
    try {
      const id = req.params.id;

      const deletedCategory = await CategoryModel.delete(+id);

      if (!deletedCategory) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res
        .status(200)
        .json({ message: "Category deleted successfully", deletedCategory });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cannot delete category with associated games") {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "No category found" });
          return;
        }
      }

      console.error("Delete category error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while deleting the category" });
    }
  }

  static async addGameToCategory(
    req: Request<{ id: string; gameId: string }>,
    res: Response
  ) {
    try {
      const id = req.params.id;
      const gameId = req.params.gameId;

      const result = await CategoryModel.addGameToCategory(+id, +gameId);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Game is already in this category") {
          res.status(409).json({ error: error.message });
          return;
        }
        if (error.message === "This Game Deleted or not Exist") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      if (error instanceof PrismaClientKnownRequestError) {
        console.log(error.meta);
        if (error.code === "P2003") {
          if (
            error.meta!.field_name === "CategoryOnGame_categoryId_fkey (index)"
          ) {
            res.status(404).json({ error: "No category found" });
            return;
          }
          if (error.meta!.field_name === "CategoryOnGame_gameId_fkey (index)") {
            res.status(404).json({ error: "No game found" });
            return;
          }
        }
      }

      console.error("Add game to category error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while adding game to category" });
    }
  }

  static async removeGameFromCategory(
    req: Request<{ id: string; gameId: string }>,
    res: Response
  ) {
    try {
      const id = req.params.id;
      const gameId = req.params.gameId;

      const result = await CategoryModel.removeGameFromCategory(+id, +gameId);
      res
        .status(200)
        .json({ message: "Game removed from category successfully", result });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res
            .status(404)
            .json({ error: "This game does not have this category" });
          return;
        }
      }

      console.error("Remove game from category error:", error);
      res.status(500).json({
        error: "Something went wrong while removing game from category",
      });
    }
  }
}
