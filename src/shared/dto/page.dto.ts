import type { Type } from '@nestjs/common';

import type { PageMetaDto } from './page-meta.dto';

export function Paginated<T>(_classRef: Type<T>) {
  abstract class PaginatedPageDto {
    constructor(data: T[], meta: PageMetaDto) {
      this.data = data;
      this.meta = meta;
    }

    public readonly data: T[];

    public readonly meta: PageMetaDto;
  }
  return PaginatedPageDto;
}
