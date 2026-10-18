"use client";
import { useGetUserManagerListQuery } from "@/entities/user/api/user.query";
import useManagerSelection from "@/widgets/manager/shared/model/useManagerSelection";

const useUserManager = () => {
    const { data, isLoading, isError, error, refetch } = useGetUserManagerListQuery();
    const { selectedItem, setSelectedItem } = useManagerSelection();
    const list = data?.result ?? [];
    const selectedUser = list.find((item) => item.id === selectedItem);
    return {
        data,
        isLoading,
        isError,
        error,
        refetch,
        selectedItem,
        setSelectedItem,
        list,
        selectedUser,
    };
};
export default useUserManager;
