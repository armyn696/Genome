import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { storePdf } from "@/utils/pdfStorage";

interface Resource {
  id: string;
  name: string;      // نام اصلی فایل
  type: string;
  size: string;
  uploadDate: string;
  url?: string;
  storagePath: string; // مسیر کامل در استوریج
}

const RESOURCES_QUERY_KEY = "resources";

export const useResources = () => {
  const queryClient = useQueryClient();

  // دریافت لیست منابع از دیتابیس
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: [RESOURCES_QUERY_KEY],
    queryFn: async () => {
      // دریافت اطلاعات فایل‌ها از جدول files
      const { data: files, error: dbError } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Error fetching files from database:', dbError);
        return [];
      }

      // تبدیل به فرمت مورد نیاز
      return files.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('pdfs')
          .getPublicUrl(file.storage_path);

        return {
          id: file.id,
          name: file.original_name,
          type: 'pdf',
          size: `${Math.round(parseInt(file.size) / 1024)} KB`,
          uploadDate: new Date(file.created_at).toLocaleDateString(),
          url: publicUrl,
          storagePath: file.storage_path
        };
      });
    }
  });

  // افزودن منبع جدید
  const addResource = useMutation({
    mutationFn: async (file: File) => {
      try {
        const { id, url, displayName } = await storePdf(file);

        const newResource: Resource = {
          id,
          name: displayName,
          type: 'pdf',
          size: `${Math.round(file.size / 1024)} KB`,
          uploadDate: new Date().toLocaleDateString(),
          url,
          storagePath: `${id}-${displayName}`
        };

        return newResource;
      } catch (error) {
        console.error('Error in addResource:', error);
        throw error;
      }
    },
    onSuccess: (newResource) => {
      queryClient.setQueryData<Resource[]>(
        [RESOURCES_QUERY_KEY],
        (old = []) => [...old, newResource]
      );
      toast({
        title: "موفقیت",
        description: "فایل با موفقیت آپلود شد"
      });
    },
    onError: (error: any) => {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "خطا در آپلود فایل. لطفا دوباره تلاش کنید."
      });
    }
  });

  // حذف منبع
  const deleteResource = useMutation({
    mutationFn: async (resourceId: string) => {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) throw new Error('Resource not found');

      // حذف از استوریج
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([resource.storagePath]);

      if (storageError) throw storageError;

      // حذف از دیتابیس
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', resourceId);

      if (dbError) throw dbError;

      return resourceId;
    },
    onSuccess: (resourceId) => {
      queryClient.setQueryData<Resource[]>(
        [RESOURCES_QUERY_KEY],
        (old = []) => old.filter(resource => resource.id !== resourceId)
      );
      toast({
        title: "موفقیت",
        description: "فایل با موفقیت حذف شد"
      });
    },
    onError: (error) => {
      console.error('Error deleting resource:', error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: "خطا در حذف فایل. لطفا دوباره تلاش کنید."
      });
    }
  });

  // تغییر نام منبع
  const renameResource = useMutation({
    mutationFn: async ({ resourceId, newName }: { resourceId: string, newName: string }) => {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) throw new Error('Resource not found');

      const newStoragePath = `${resourceId}-${newName}`;

      // دانلود فایل قدیمی
      const { data: fileData } = await supabase.storage
        .from('pdfs')
        .download(resource.storagePath);

      if (!fileData) throw new Error('Could not download file');

      // آپلود با نام جدید
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(newStoragePath, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // حذف فایل قدیمی
      const { error: deleteError } = await supabase.storage
        .from('pdfs')
        .remove([resource.storagePath]);

      if (deleteError) throw deleteError;

      // به‌روزرسانی در دیتابیس
      const { error: dbError } = await supabase
        .from('files')
        .update({
          original_name: newName,
          storage_path: newStoragePath
        })
        .eq('id', resourceId);

      if (dbError) throw dbError;

      return { resourceId, newName, newStoragePath };
    },
    onSuccess: ({ resourceId, newName, newStoragePath }) => {
      queryClient.setQueryData<Resource[]>(
        [RESOURCES_QUERY_KEY],
        (old = []) => old.map(resource => {
          if (resource.id === resourceId) {
            const { data: { publicUrl } } = supabase.storage
              .from('pdfs')
              .getPublicUrl(newStoragePath);

            return {
              ...resource,
              name: newName,
              storagePath: newStoragePath,
              url: publicUrl
            };
          }
          return resource;
        })
      );
      toast({
        title: "موفقیت",
        description: "نام فایل با موفقیت تغییر کرد"
      });
    },
    onError: (error) => {
      console.error('Error renaming resource:', error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: "خطا در تغییر نام فایل. لطفا دوباره تلاش کنید."
      });
    }
  });

  return {
    resources,
    addResource: addResource.mutate,
    deleteResource: deleteResource.mutate,
    renameResource: renameResource.mutate,
  };
};