// File: app/controllers/CleanerDashboardController.ts
// This controller manages the logic and data interactions for the Cleaner's main dashboard page.

// --- Core Imports ---
import { supabase } from "../lib/supabaseClient"; // Supabase client for direct DB access where models aren't fully fleshed out yet

// --- Type Imports from other Controllers (for data consistency) ---
import type { User } from "./viewUserProfileController"; // Represents the main user data structure

// --- Type Imports from Models (to be re-exported for the Boundary) ---
import type { PortfolioImage as ModelPortfolioImage } from "../models/portfolioImage";
import type { History as ModelJobHistoryItem } from "../models/userHistoryModel"; // 'History' is the job item type

// --- Service Imports (Controllers can use Services as part of their logic) ---
import { UserProfileService } from "../services/UserProfileServices";
import { JobService } from "../services/JobServices";
// Note: PortfolioController is used directly by the Boundary in this example,
// as it's already a controller.

// --- Type Re-exports for Boundary Consumption ---
// This allows the Boundary (cleaner.tsx) to get its necessary data types
// solely from this controller, adhering to the BCE pattern where Boundary -> Control.
export type PortfolioImage = ModelPortfolioImage;
export type JobHistoryItem = ModelJobHistoryItem; // Re-exporting the 'History' type as 'JobHistoryItem'

// --- Interface Definitions specific to this Controller's operations ---
export interface AvailabilityRecord {
  id: string;
  cleaner_id: string; // Should match the UUID type of users.id
  service: string;
  date: string; // Consider using Date object or ISO string consistently
  created_at?: string; // Or Date
}

export interface InitialCleanerProfileData {
  userData: User | null;
  shortlistCount: number;
  completedJobCount: number;
}

// --- Controller Class ---
export class CleanerDashboardController {
  private userId: string;
  private userProfileService: UserProfileService;
  private jobService: JobService;

  constructor(userId: string) {
    if (!userId) {
      // It's crucial to handle cases where userId might be missing early.
      throw new Error(
        "User ID is required to initialize CleanerDashboardController."
      );
    }
    this.userId = userId;
    // Instantiate services needed by this controller
    this.userProfileService = new UserProfileService(this.userId);
    this.jobService = new JobService(this.userId);
  }

  // --- Profile Tab Logic ---

  /**
   * Fetches initial data required for the cleaner's profile view.
   * @returns {Promise<InitialCleanerProfileData>} Aggregated profile data.
   */
  async getInitialProfileData(): Promise<InitialCleanerProfileData> {
    // Fetch user data, shortlist count, and completed job count in parallel for efficiency.
    const [userData, shortlistCount, completedJobCount] = await Promise.all([
      this.userProfileService.fetchUserData(),
      this.userProfileService.getShortlistCount(),
      this.fetchCompletedJobCountInternal(), // Internal helper for direct DB query
    ]);
    return { userData, shortlistCount, completedJobCount };
  }

  async getViewCount(): Promise<number> {
    const { count, error } = await supabase
      .from("cleaner_views")
      .select("*", { count: "exact", head: true })
      .eq("cleaner_id", this.userId);

    if (error) {
      console.error("Error fetching view count:", error.message);
      throw new Error(`Failed to fetch view count: ${error.message}`);
    }
    return count || 0;
  }

  async getFavoriteCount(): Promise<number> {
    const { count, error } = await supabase
      .from("cleaner_favorites")
      .select("*", { count: "exact", head: true })
      .eq("cleaner_id", this.userId);

    if (error) {
      console.error("Error fetching favorite count:", error.message);
      throw new Error(`Failed to fetch favorite count: ${error.message}`);
    }
    return count || 0;
  }

  /**
   * Updates the cleaner's biography.
   * @param {string} bio - The new biography text.
   * @returns {Promise<User | null>} The updated user data.
   */
  async updateUserBio(bio: string): Promise<User | null> {
    // Delegate to UserProfileService to handle the update.
    await this.userProfileService.updateBio(bio);
    // Re-fetch user data to return the latest state.
    // An alternative is optimistic updates in the UI, but re-fetching ensures consistency.
    return this.userProfileService.fetchUserData();
  }

  /**
   * Internal helper to fetch the count of completed jobs for the cleaner.
   * This demonstrates a direct Supabase call within the controller.
   * Ideally, complex queries might be further abstracted into a model or service method.
   * @returns {Promise<number>} The count of completed jobs.
   */
  private async fetchCompletedJobCountInternal(): Promise<number> {
    const { count, error } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true }) // 'head: true' makes it a HEAD request, only fetching count
      .eq("cleaner_id", this.userId)
      .eq("status", "Completed");

    if (error) {
      console.error(
        "CleanerDashboardController: Error fetching completed job count:",
        error.message
      );
      throw new Error(`Failed to fetch completed job count: ${error.message}`);
    }
    return count || 0;
  }

  // --- Availability Tab Logic ---

  /**
   * Fetches the cleaner's current availability schedule.
   * @returns {Promise<AvailabilityRecord[]>} A list of availability records.
   */
  async getCurrentAvailability(): Promise<AvailabilityRecord[]> {
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("cleaner_id", this.userId)
      .order("date", { ascending: true });

    if (error) {
      console.error(
        "CleanerDashboardController: Error fetching availability:",
        error.message
      );
      throw new Error(`Failed to load availability: ${error.message}`);
    }
    return (data as AvailabilityRecord[]) || []; // Cast to ensure type safety
  }

  /**
   * Saves new availability slots for the cleaner.
   * @param {string} date - The date of availability.
   * @param {string[]} services - A list of services offered on that date.
   */
  async saveAvailability(date: string, services: string[]): Promise<void> {
    if (!services || services.length === 0 || !date) {
      throw new Error("Service(s) and date are required to save availability.");
    }
    // Further validation (e.g., against STANDARD_SERVICES) could be done here or in the Boundary.
    const recordsToInsert = services.map((service) => ({
      cleaner_id: this.userId,
      service,
      date,
    }));

    const { error } = await supabase
      .from("availability")
      .insert(recordsToInsert);

    if (error) {
      console.error(
        "CleanerDashboardController: Error saving availability:",
        error.message
      );
      throw new Error(`Failed to save availability: ${error.message}`);
    }
  }

  /**
   * Deletes a specific availability slot for the cleaner.
   * @param {string} availabilityId - The ID of the availability record to delete.
   */
  async deleteAvailability(availabilityId: string): Promise<void> {
    const { error } = await supabase
      .from("availability")
      .delete()
      .eq("id", availabilityId)
      .eq("cleaner_id", this.userId); // Security: Ensure cleaner only deletes their own slots

    if (error) {
      console.error(
        "CleanerDashboardController: Error deleting availability:",
        error.message
      );
      throw new Error(`Failed to delete availability: ${error.message}`);
    }
  }

  // --- Work Completed & Bookings Tabs Logic ---

  /**
   * Fetches the cleaner's completed job history.
   * Delegates to JobService.
   * @param {'asc' | 'desc'} sortOrder - The order to sort jobs by date.
   * @param {string} [serviceFilter] - Optional filter by service type.
   * @param {{ start: string; end: string }} [dateRange] - Optional filter by date range.
   * @returns {Promise<JobHistoryItem[]>} A list of completed job history items.
   */
  async getWorkHistory(
    sortOrder: "asc" | "desc",
    serviceFilter?: string,
    dateRange?: { start: string; end: string }
  ): Promise<JobHistoryItem[]> {
    return this.jobService.fetchCompletedJobs(
      sortOrder,
      serviceFilter,
      dateRange
    );
  }

  /**
   * Fetches the cleaner's current bookings (pending, approved, rejected).
   * Delegates to JobService.
   * @param {'asc' | 'desc'} sortOrder - The order to sort bookings by date.
   * @returns {Promise<JobHistoryItem[]>} A list of booking items.
   */
  async getBookings(sortOrder: "asc" | "desc"): Promise<JobHistoryItem[]> {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
      *,
      users!jobs_homeowner_id_fkey (
        name,
        email
      )
    `
      )
      .eq("cleaner_id", this.userId)
      .not("status", "eq", "Completed") // Get all non-completed jobs
      .order("date", { ascending: sortOrder === "asc" });

    if (error) {
      console.error("Error fetching bookings:", error.message);
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    // Transform the data to include customer name
    return (data || []).map((job) => ({
      ...job,
      customer_name: job.users?.name || "Unknown",
    }));
  }

  /**
   * Updates the status of a specific job.
   * @param {string} jobId - The ID of the job to update.
   * @param {string} newStatus - The new status for the job.
   */
  async updateJobStatus(jobId: string, newStatus: string): Promise<void> {
    // This could also be a method in JobService for better encapsulation of job-related logic.
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)
      .eq("cleaner_id", this.userId); // Security: Ensure cleaner updates only their jobs

    if (error) {
      console.error(
        "CleanerDashboardController: Error updating job status:",
        error.message
      );
      throw new Error(`Failed to update job status: ${error.message}`);
    }
  }

  /**
   * Reports a problem associated with a job.
   * Delegates to JobService.
   * @param {string} jobId - The ID of the job being reported.
   * @param {string} reason - The reason for the report.
   */
  async reportProblemOnJob(jobId: string, reason: string): Promise<void> {
    // JobService already encapsulates the logic for reporting a job.
    return this.jobService.reportJob(jobId, reason);
  }

  /**
   * Fetches a list of services the cleaner can offer or has offered.
   * This can be used to populate service selection dropdowns.
   * Delegates to JobService.
   * @returns {Promise<string[]>} A list of service names.
   */
  async getAvailableServicesForProfile(): Promise<string[]> {
    // This method in JobService likely fetches distinct services the cleaner has completed.
    return this.jobService.fetchAvailableServices();
  }
}
