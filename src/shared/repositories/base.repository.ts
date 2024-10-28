import type {
  Document,
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
} from 'mongoose';

export class BaseRepository<T, TD extends Document> {
  constructor(private readonly model: Model<TD>) {}

  /**
   * Create a new document in the collection.
   * @param createDto - The data transfer object containing the fields for the new document.
   * @returns The created document.
   */
  async create(createDto: T): Promise<TD> {
    const createdDocument = new this.model(createDto);
    return await createdDocument.save();
  }

  /**
   * Find all documents that match the given filter, excluding soft-deleted ones.
   * @param filter - The filter query to match documents.
   * @returns An array of matching documents.
   */
  async findAll(filter: FilterQuery<TD> = {}): Promise<TD[]> {
    return await this.model
      .find({ ...filter, deletedAt: { $eq: null } })
      .exec();
  }

  /**
   * Find a single document that matches the given filter, excluding soft-deleted ones.
   * @param filter - The filter query to match the document.
   * @returns The matching document, or null if not found.
   */
  async findOne(filter: FilterQuery<TD>): Promise<TD | null> {
    return await this.model
      .findOne({ ...filter, deletedAt: { $eq: null } })
      .exec();
  }

  /**
   * Find a document by its ID, excluding soft-deleted ones.
   * @param id - The ID of the document to find.
   * @returns The matching document, or null if not found.
   */
  async findById(id: Types.ObjectId): Promise<TD | null> {
    return await this.model
      .findOne({ _id: id, deletedAt: { $eq: null } })
      .exec();
  }

  /**
   * Update a document that matches the given filter, excluding soft-deleted ones.
   * @param filter - The filter query to match the document.
   * @param updateDto - The data transfer object containing the fields to update.
   * @returns The updated document, or null if not found.
   */
  async update(
    filter: FilterQuery<TD>,
    updateDto: UpdateQuery<TD>,
  ): Promise<TD | null> {
    return await this.model
      .findOneAndUpdate({ ...filter, deletedAt: { $eq: null } }, updateDto, {
        new: true,
      })
      .exec();
  }

  /**
   * Delete a document by setting the deletedAt field to the current date.
   * @param filter - The filter query to match the document.
   * @returns The soft-deleted document, or null if not found.
   */
  async delete(filter: FilterQuery<TD>): Promise<TD | null> {
    return this.softDelete(filter);
  }

  /**
   * Permanently delete a document that matches the given filter.
   * @param filter - The filter query to match the document.
   * @returns The result of the deletion.
   */
  async hardDelete(filter: FilterQuery<TD>): Promise<any> {
    return await this.model.deleteOne(filter).exec();
  }

  /**
   * Soft delete a document by setting the deletedAt field to the current date.
   * @param filter - The filter query to match the document.
   * @returns The soft-deleted document, or null if not found.
   */
  async softDelete(filter: FilterQuery<TD>): Promise<TD | null> {
    return await this.model
      .findOneAndUpdate(
        { ...filter, deletedAt: { $eq: null } },
        { deletedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  /**
   * Restore a soft-deleted document by setting the deletedAt field to null.
   * @param filter - The filter query to match the document.
   * @returns The restored document, or null if not found.
   */
  async restore(filter: FilterQuery<TD>): Promise<TD | null> {
    return await this.model
      .findOneAndUpdate(
        { ...filter, deletedAt: { $ne: null } },
        { deletedAt: null },
        { new: true },
      )
      .exec();
  }

  /**
   * Count the number of documents that match the given filter, excluding soft-deleted ones.
   * @param filter - The filter query to match documents.
   * @returns The count of matching documents.
   */
  async count(filter: FilterQuery<TD> = {}): Promise<number> {
    return await this.model
      .countDocuments({ ...filter, deletedAt: { $eq: null } })
      .exec();
  }

  /**
   * Check if a document that matches the given filter exists, excluding soft-deleted ones.
   * @param filter - The filter query to match the document.
   * @returns True if the document exists, false otherwise.
   */
  async exists(filter: FilterQuery<TD>): Promise<boolean> {
    const result = await this.model.exists({
      ...filter,
      deletedAt: { $eq: null },
    });
    return result !== null;
  }
}
