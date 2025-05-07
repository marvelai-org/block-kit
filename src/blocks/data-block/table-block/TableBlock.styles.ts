// TableBlock.styles.ts
// Style definitions for TableBlock component

import styled from 'styled-components';

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.background || '#fff'};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
`;

export const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.headerBackground || '#f5f5f5'};
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background: ${({ theme }) => theme.colors.rowAlt || '#fafbfc'};
  }
`;

export const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
`;

// Add more styled components as needed for pagination, filters, etc.
