import { type PipeTransform, BadRequestException } from "@nestjs/common";
import z from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    const { data, error } = this.schema.safeParse(value);
    if (error && error.issues.every((issue) => issue.path.length > 0)) {
      console.log(error);

      throw new BadRequestException({
        ok: false,
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    return data;
  }
}
