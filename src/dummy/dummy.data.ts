/* 






/* 

hooks

'use client';

import axiousResuest from '@/lib/axiosRequest';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export interface employeeResponseType {
  id: '497f6eca-6276-4993-bfeb-53cbbbba6f08';
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string;
  created_at?: Date;
  company: {
    id: string;
    name: string;
    email: string;
    logo: string;
    created_at?: Date;
    updated_at?: Date;
  };
}

export const useGetEmployeesList = () => {
  const { data: session }: any = useSession();
  return useQuery({
    queryKey: ['agencyEmployeesList'],
    queryFn: () =>
      axiousResuest({
        url: `/agency/employees/`,
        method: 'get',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }),
  });
};

export const useCreateEmployees = () => {
  const queryClient = useQueryClient();
  const { data: session }: any = useSession();
  return useMutation({
    mutationFn: async (body: any) =>
      await axiousResuest({
        url: `/agency/employees/`,
        method: 'post',
        data: body,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyEmployeesList'] });
    },
  });
};

export const useUpdateEmployee = (id: string) => {
  const queryClient = useQueryClient();
  const { data: session }: any = useSession();
  return useMutation({
    mutationFn: async (body: any) =>
      await axiousResuest({
        url: `/agency/employees/${id}/`,
        method: 'patch',
        data: body,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyEmployeesList'] });
    },
  });
};

export const useDeleteEmployee = (id: string) => {
  const queryClient = useQueryClient();
  const { data: session }: any = useSession();
  return useMutation({
    mutationFn: async (body: any) =>
      await axiousResuest({
        url: `/agency/employees/${id}/`,
        method: 'delete',
        data: body,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyEmployeesList'] });
    },
  });
};

*/



/* 


    const ContactColumn: DashboardTableColumn[] = [
        {
            title: "SL No",
            dataKey: "serial",
            row: (rowData: contactDataType, rowIndex = 0) => <div className='min-w-12'>{rowIndex + 1}</div>,
        },
        {
            title: "Title",
            dataKey: "title",
            row: (data: contactDataType) => <div className='min-w-[280px] max-w-[400px]'>
                <p className='text-w-title-1-Medium-22 line-clamp-1 text-oc-primary-1-600'>{data?.name}</p>
                <p className='text-oc-white-800 line-clamp-1'>{data?.email}</p>
            </div>,
        },
        {
            title: "Message ",
            dataKey: "details",
            row: (data: contactDataType) => (
                <div className='line-clamp-2 text-oc-primary-1-600 min-w-[280px] max-w-[400px]'>
                    {data?.message}
                </div>
            ),
        },
        {
            title: "Uploaded Date",
            dataKey: "created_at",
            row: (data: contactDataType) => (
                <div className='min-w-[180px] max-w-[500px]'>
                    {formatDatestamp(data?.created_at)}
                </div>
            ),
        },
        {
            title: "Website Link ",
            dataKey: "details",
            row: (data: contactDataType) => (
                <div className='line-clamp-2 text-oc-primary-1-600  max-w-[400px]'>
                    <Link target='_blank' href={data?.site || ''}>
                        {data?.site}
                    </Link>
                </div>
            ),
        },
        {
            title: "Action",
            dataKey: "action",
            row: (data: contactDataType) => (
                <div className=''>
                    <ContactColumnAction data={data} />
                </div>
            ),
        },
    ];




                    <DashboardTable
                    columns={ContactColumn}
                    isLoading={isLoading}
                    data={contactData?.results || []}
                />

*/