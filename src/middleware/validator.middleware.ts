import { Request, Response, NextFunction } from "express";
import { z, ZodEffects } from "zod";

interface ValidatorOptions {
  body?: z.AnyZodObject | ZodEffects<any>;
  query?: z.AnyZodObject | ZodEffects<any>;
  params?: z.AnyZodObject | ZodEffects<any>;
}

export function validator(options: ValidatorOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options.body) {
        const validatedBody = await options.body.parseAsync(req.body);
        req.body = validatedBody;
      }

      if (options.query) {
        const validatedQuery = await options.query.parseAsync(req.query);
        req.query = validatedQuery;
      }

      if (options.params) {
        const validatedParams = await options.params.parseAsync(req.params);
        req.params = validatedParams;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({
          error: error.errors,
          message: "Validation error",
        });
        return;
      }
      next(error);
    }
  };
}
