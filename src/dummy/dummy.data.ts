/* 

// axiousRequest
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiousResuest = async (options: AxiosRequestConfig) => {
  const onSuucess = (res: AxiosResponse) => {
    return res.data;
  };

  const onError = (err: AxiosError) => {
    // console.log(555, err.request.response)
    throw err.response?.data;
  };

  return axios(options).then(onSuucess).catch(onError);
};

export default axiousResuest;







//  validation
import * as yup from 'yup';


export const ContactFormValidation = () =>
    yup.object().shape({
        name: yup.string().max(255).required('This field is required'),
        email: yup.string().max(1500).required('This field is required'),
        // site: yup.string().required('This field is required'),
        message: yup.string().required('This field is required'),

    });



// form submission

// Define the types for the props of the Newsletter component
type NewsletterProps = {
  handleDataSubmit: Function;
  isLoading: boolean;
};

// Newsletter component with type safety
const Newsletter: React.FC<NewsletterProps> = ({
  handleDataSubmit,
  isLoading,
}) => {
  const { handleChange, values, touched, errors, handleSubmit, resetForm } =
    useFormik({
      initialValues: {
        email: "",
      },
      validationSchema: yup.object().shape({
        email: yup.string().email().required("This Field is Required"),
      }),
      onSubmit: async (data) => {
        try {
          await handleDataSubmit(data);
          toast({
            //   variant: 'success',
            description: "Subscription completed",
          });
          resetForm();
        } catch (err: any) {
          err.errors.forEach((key: { attr: string; detail: string }) => {
            toast({
              description: `${key?.attr} - ${key?.detail}`,
            });
          });
        }
      },
    });

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <TextInput
          id="email"
          type="email"
          name="email"
          onChange={handleChange}
          value={values.email}
          error={
            Boolean(errors.email) && touched.email ? errors.email : undefined
          }
          placeholder="Enter Your Email"
        />
        <div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-oc-primary-3-500 text-oc-primary-1-900"
            label={isLoading ? "Sending.." : "Sent"}
          />
        </div>
      </form>
    </div>
  );
};
*/





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