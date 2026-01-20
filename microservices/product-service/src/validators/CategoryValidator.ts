// Category Validator - SOLID: Single Responsibility for category validation
import { BaseValidator } from '../common/BaseValidator';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dto';

export class CategoryValidator extends BaseValidator<CreateCategoryDTO, UpdateCategoryDTO> {
  /**
   * Validate create category data
   */
  validateCreate(data: CreateCategoryDTO): void {
    this.validateRequired(data.name, 'Name');
    this.validateRequired(data.slug, 'Slug');
    this.validateSlug(data.slug, 'Slug');
  }

  /**
   * Validate update category data
   */
  validateUpdate(data: UpdateCategoryDTO): void {
    this.validateNonEmpty(data.name, 'Name');
    this.validateNonEmpty(data.slug, 'Slug');
    if (data.slug) {
      this.validateSlug(data.slug, 'Slug');
    }
  }
}
