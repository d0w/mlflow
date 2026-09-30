import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { DesignSystemProvider } from '@databricks/design-system';
import { QueryClient, QueryClientProvider } from '@mlflow/mlflow/src/common/utils/reactQueryHooks';
import { testRoute, TestRouter } from '../../common/utils/RoutingTestUtils';
import { MCPServerCardGrid } from './MCPServerCardGrid';
import { createMockMCPServer } from '../test-utils';

const noop = () => {};

const defaultPaginationProps = {
  page: 1,
  perPage: 25,
  onSetPage: noop,
};

const renderGrid = (
  props: Omit<React.ComponentProps<typeof MCPServerCardGrid>, 'paginationProps'> & {
    paginationProps?: React.ComponentProps<typeof MCPServerCardGrid>['paginationProps'];
  },
) => {
  const queryClient = new QueryClient();
  const { paginationProps = defaultPaginationProps, ...gridProps } = props;
  return render(
    <IntlProvider locale="en">
      <TestRouter
        routes={[
          testRoute(
            <QueryClientProvider client={queryClient}>
              <DesignSystemProvider>
                <MCPServerCardGrid {...gridProps} paginationProps={paginationProps} />
              </DesignSystemProvider>
            </QueryClientProvider>,
            '/',
          ),
        ]}
      />
    </IntlProvider>,
  );
};

describe('MCPServerCardGrid', () => {
  it('renders loading spinner when isLoading is true', () => {
    renderGrid({ paginationProps: defaultPaginationProps, isLoading: true });
    expect(screen.getByText('Loading servers...')).toBeInTheDocument();
  });

  it('renders "No servers found" when filtered and no results', () => {
    renderGrid({ paginationProps: defaultPaginationProps, servers: [], isFiltered: true });
    expect(screen.getByText('No servers found')).toBeInTheDocument();
  });

  it('renders empty state when no servers and not filtered', () => {
    renderGrid({ paginationProps: defaultPaginationProps, servers: [] });
    expect(screen.getByText('Register and catalog MCP servers for your organization.')).toBeInTheDocument();
  });

  it('renders a card for each server', () => {
    const servers = [
      createMockMCPServer({ name: 'server-a' }),
      createMockMCPServer({ name: 'server-b' }),
      createMockMCPServer({ name: 'server-c' }),
    ];
    renderGrid({ paginationProps: defaultPaginationProps, servers });
    expect(screen.getByText('server-a')).toBeInTheDocument();
    expect(screen.getByText('server-b')).toBeInTheDocument();
    expect(screen.getByText('server-c')).toBeInTheDocument();
  });

  it('does not render loading spinner when servers are present', () => {
    renderGrid({ paginationProps: defaultPaginationProps, servers: [createMockMCPServer()], isLoading: false });
    expect(screen.queryByText('Loading servers...')).not.toBeInTheDocument();
  });

  it('renders pagination controls when servers are present', () => {
    const servers = [createMockMCPServer()];
    renderGrid({ paginationProps: defaultPaginationProps, servers });
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument();
  });

  it('calls onSetPage when next is clicked', () => {
    const onSetPage = jest.fn();
    const servers = [createMockMCPServer()];
    renderGrid({ paginationProps: { ...defaultPaginationProps, onSetPage }, servers });
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onSetPage).toHaveBeenCalledWith(expect.anything(), 2, 25, 25, 50);
  });

  it('calls onSetPage when previous is clicked', () => {
    const onSetPage = jest.fn();
    const servers = [createMockMCPServer()];
    renderGrid({ paginationProps: { ...defaultPaginationProps, page: 2, onSetPage }, servers });
    fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(onSetPage).toHaveBeenCalledWith(expect.anything(), 1, 25, 0, 25);
  });

  it('renders page size selector', () => {
    const servers = [createMockMCPServer()];
    renderGrid({
      paginationProps: {
        ...defaultPaginationProps,
        perPageOptions: [10, 25, 50].map((value) => ({ title: String(value), value })),
      },
      servers,
    });
    fireEvent.click(screen.getByRole('button', { name: '1 - 25 of 0' }));
    expect(screen.getByText('25 per page')).toBeInTheDocument();
  });
});
