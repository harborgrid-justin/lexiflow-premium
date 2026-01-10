import { ProjectsApiService } from "@/api/workflow/projects-api";
import { Repository } from "@/services/core/Repository";
import { Project } from "@/types";

export class ProjectRepository extends Repository<Project> {
  private projectsApi: ProjectsApiService;

  constructor() {
    super("projects");
    this.projectsApi = new ProjectsApiService();
    console.log("[ProjectRepository] Initialized with Backend API");
  }

  // Override base methods to use API
  async getAll(options?: Record<string, unknown>): Promise<Project[]> {
    try {
      // API expects filters, options might be generic. mapping might be needed.
      return (await this.projectsApi.getAll(options)) as unknown as Project[];
    } catch (error) {
      console.error("[ProjectRepository] Error fetching projects:", error);
      throw error;
    }
  }

  async getById(id: string): Promise<Project | null> {
    try {
      return (await this.projectsApi.getById(id)) as unknown as Project;
    } catch (error) {
      // getById usually throws if not found in backend or returns null?
      // Repository pattern expects null if not found or throws EntityNotFoundError.
      // We'll let it throw or handle.
      console.error(`[ProjectRepository] Error fetching project ${id}:`, error);
      throw error;
    }
  }

  async add(item: Partial<Project>): Promise<Project> {
    try {
      return (await this.projectsApi.create(item)) as unknown as Project;
    } catch (error) {
      console.error("[ProjectRepository] Error creating project:", error);
      throw error;
    }
  }

  async update(id: string, item: Partial<Project>): Promise<Project> {
    try {
      return (await this.projectsApi.update(id, item)) as unknown as Project;
    } catch (error) {
      console.error(`[ProjectRepository] Error updating project ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.projectsApi.delete(id);
    } catch (error) {
      console.error(`[ProjectRepository] Error deleting project ${id}:`, error);
      throw error;
    }
  }
}
