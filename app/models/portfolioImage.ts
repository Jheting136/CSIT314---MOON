// models/portfolioImage.ts

export class PortfolioImage {
  constructor(
    public id: string,         // Unique ID or file name
    public userId: string,     // User ID who uploaded the image
    public publicUrl: string,  // Public URL for the image
    public createdAt: Date     // Date when the image was created/uploaded
  ) {}
}
