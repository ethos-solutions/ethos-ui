import { useState, useEffect } from 'react';
import { useRestQuery } from '@ethos-frontend/hook';

import { UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

interface OptionsProps {
  value: string;
  label: string;
}

interface DropdownData {
  data: OptionsProps[];
  isLoading: boolean;
  refetch: () => void;
}

type UseDropdownOptions = Omit<
  UseQueryOptions<AxiosResponse, AxiosError, AxiosResponse>,
  'queryKey' | 'queryFn'
>;

export const useDropdownData = (
  key: QueryKey | string,
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterFn: (data: any) => OptionsProps[],
  options?: UseDropdownOptions,
): DropdownData => {
  const [dropdownData, setDropdownData] = useState<OptionsProps[]>([]);
  const { data, isLoading, refetch } = useRestQuery<AxiosResponse, AxiosError>(
    key,
    url,
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
      // onSuccess is still supported in our wrapper (if not, you can use useEffect below)
      onSuccess: (res) => {
        const mapped = filterFn(res.data);
        setDropdownData(mapped);
      },
      ...options,
    },
  );

  // In case onSuccess is not used or data changes:
  useEffect(() => {
    if (data && dropdownData.length === 0) {
      const mapped = filterFn(data.data);
      setDropdownData(mapped);
    }
  }, [data, dropdownData.length, filterFn]);

  return { data: dropdownData, isLoading, refetch };
};
