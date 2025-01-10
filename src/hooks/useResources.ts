import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const RESOURCES_QUERY_KEY = "resources";

export const useResources = () => {
  const queryClient = useQueryClient();

  // Get resources from cache
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: [RESOURCES_QUERY_KEY],
    queryFn: () => [], // Initially empty, will be populated by mutations
    initialData: [],
  });

  // Add resource mutation
  const addResource = useMutation({
    mutationFn: (newResource: Resource) => {
      return Promise.resolve(newResource);
    },
    onSuccess: (newResource) => {
      queryClient.setQueryData<Resource[]>(
        [RESOURCES_QUERY_KEY],
        (old = []) => [...old, newResource]
      );
    },
  });

  // Delete resource mutation
  const deleteResource = useMutation({
    mutationFn: (resourceId: string) => {
      return Promise.resolve(resourceId);
    },
    onSuccess: (resourceId) => {
      queryClient.setQueryData<Resource[]>(
        [RESOURCES_QUERY_KEY],
        (old = []) => old.filter((resource) => resource.id !== resourceId)
      );
    },
  });

  return {
    resources,
    addResource: addResource.mutate,
    deleteResource: deleteResource.mutate,
  };
};