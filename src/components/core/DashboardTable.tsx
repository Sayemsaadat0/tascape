import React, { FC } from 'react';

export type DashboardTableColumn = {
  title: string;
  dataKey: string;
  row: (data: any, rowIndex: number) => React.ReactNode;
};

export type DashboardTableProps = {
  columns: DashboardTableColumn[];
  data: any[];
  isLoading: boolean;
};

const DashboardTable: FC<DashboardTableProps> = ({ columns, data, isLoading }) => {
  return (
    <div className="overflow-x-auto max-w-full border bg-white border-t-black rounded-[10px] overflow-hidden">
      <div className="w-full">
        <table className="w-full text-left">
          <thead className="sticky z-10 top-0 w-full h-fit bg-t-black">
            <tr className=''>
              {columns.map((column, index) => (
                <th key={index} scope="col" className="px-3 py-3 text-white last:text-right">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="w-full bg-white">
            {!isLoading &&
              data &&
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${rowIndex !== data.length - 1 ? 'border-b' : ''} border-t-black`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-3 py-3 wrap-break-word last:text-right text-black">
                      {column.row(row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        {isLoading && (
          <div className="flex justify-center items-center h-10 my-6 ">
            <p className="text-black">Loading...</p>
          </div>
        )}
        {!isLoading && data.length === 0 && (
          <div className="flex justify-center items-center my-6 ">
            <p className="text-black">No Data Available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTable;
