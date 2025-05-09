// controllers/portfolioController.ts
import { supabase } from '../lib/supabaseClient'; // Importing Supabase client
import { PortfolioImage } from '../models/portfolioImage'; // PortfolioImage model

export class PortfolioController {
  private static BUCKET_NAME = 'portfolio'; // The Supabase storage bucket name

  // Method to upload an image to the portfolio
  static async uploadImage(userId: string, file: File): Promise<PortfolioImage> {
    try {
      // Generate a unique file path in the bucket
      const fileExt = file.name.split('.').pop();
      const filePath = `portfolio/${userId}/${Date.now()}.${fileExt}`;

      // Upload the image to the storage bucket
      const { error: uploadError } = await supabase.storage.from(this.BUCKET_NAME).upload(filePath, file);

      if (uploadError) {
        throw new Error('Failed to upload image: ' + uploadError.message);
      }

      // Fetch the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(filePath);
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL after upload');
      }

      // Return a new PortfolioImage object with the uploaded image data
      const portfolioImage = new PortfolioImage(
        `${userId}/${filePath}`,  // ID could be based on the userId and file path
        userId,
        publicUrlData.publicUrl,
        new Date()  // Created at current time
      );

      return portfolioImage;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Method to fetch all portfolio images for a given user
  static async fetchImages(userId: string): Promise<PortfolioImage[]> {
    try {
      // List all files in the user's portfolio folder (limiting to 100 files for simplicity)
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list(`portfolio/${userId}`, {
        limit: 100,
        offset: 0,
      });

      // If an error occurred while fetching the files, throw an error
      if (error) {
        throw new Error('Failed to fetch portfolio images: ' + error.message);
      }

      // If no data is returned (i.e., no files are found), return an empty array
      if (!data || data.length === 0) {
        return [];
      }

      // Map through the files and create PortfolioImage objects
      const portfolioImages = await Promise.all(
        data.map(async (file) => {
          try {
            // Get the public URL for each file
            const { data: publicUrlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(`portfolio/${userId}/${file.name}`);
            
            // If the public URL data is missing, throw an error
            if (!publicUrlData || !publicUrlData.publicUrl) {
              throw new Error('Failed to fetch public URL for file: ' + file.name);
            }

            // Create a PortfolioImage instance using the file data and return it
            return new PortfolioImage(
              file.name,  // You can use the file name or create a custom ID
              userId,
              publicUrlData.publicUrl, // Public URL for the file
              new Date(file.created_at) // Assuming `created_at` is available (if not, handle it as needed)
            );
          } catch (error) {
            // Handle any error that happens while fetching the public URL for this file
            console.error('Error fetching public URL for file:', file.name, error);
            throw new Error('Error fetching public URL for file: ' + file.name);
          }
        })
      );

      // Return the array of PortfolioImage objects
      return portfolioImages;

    } catch (error: unknown) {
      // General error handler for the entire method
      console.error('Error fetching images:', error);

      if (error instanceof Error) {
        // If the error is an instance of Error, access its message safely
        throw new Error(`Error fetching images: ${error.message}`);
      } else {
        // If the error is not an instance of Error, throw a generic error
        throw new Error('Unknown error occurred while fetching images');
      }
    }
  }

  // Method to delete an image from the portfolio
  static async deleteImage(userId: string, fileName: string): Promise<void> {
    try {
      // Construct the file path
      const filePath = `portfolio/${userId}/${fileName}`;

      // Remove the file from storage
      const { error } = await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
      
      if (error) {
        throw new Error('Failed to delete image: ' + error.message);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}
