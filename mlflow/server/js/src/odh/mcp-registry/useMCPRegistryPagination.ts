import { useEffect, useState } from 'react';
import type { CursorPaginationProps } from '@databricks/design-system';
import type { PaginationProps } from '@patternfly/react-core';

import type { MCPServer } from '../../mcp-registry/types';

export const useMCPRegistryPagination = ({
  servers,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  pageSizeSelect,
  isFetching,
  searchFilter,
  filterActive,
  filterHasEndpoints,
}: {
  servers?: MCPServer[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageSizeSelect?: CursorPaginationProps['pageSizeSelect'];
  isFetching: boolean;
  searchFilter: string;
  filterActive: boolean;
  filterHasEndpoints: boolean;
}): PaginationProps => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, filterActive, filterHasEndpoints]);

  const pageSize = pageSizeSelect?.default ?? 25;
  const onNext = () => {
    if (isFetching || !hasNextPage) return;
    onNextPage();
    setCurrentPage((page) => page + 1);
  };
  const onPrevious = () => {
    if (isFetching || !hasPreviousPage) return;
    onPreviousPage();
    setCurrentPage((page) => page - 1);
  };
  const onSetPage: NonNullable<PaginationProps['onSetPage']> = (_event, page) => {
    if (page > currentPage) onNext();
    if (page < currentPage) onPrevious();
  };
  const onPerPageSelect: NonNullable<PaginationProps['onPerPageSelect']> = (_event, newPageSize) => {
    pageSizeSelect?.onChange(newPageSize);
    setCurrentPage(1);
  };
  const currentPageItemCount = (currentPage - 1) * pageSize + (servers?.length ?? 0);

  return {
    page: currentPage,
    perPage: pageSize,
    perPageOptions: pageSizeSelect?.options.map((value) => ({ title: String(value), value })),
    itemCount: hasNextPage ? currentPage * pageSize + 1 : currentPageItemCount,
    toggleTemplate: `${(currentPage - 1) * pageSize + 1} - ${currentPageItemCount}`,
    isDisabled: isFetching,
    onSetPage,
    onPerPageSelect,
  };
};
