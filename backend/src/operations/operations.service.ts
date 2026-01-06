import { Injectable } from "@nestjs/common";

@Injectable()
export class OperationsService {
  async getMaintenanceTickets() {
    return [
      {
        id: "MT-101",
        loc: "HQ - Floor 5",
        issue: "HVAC Maintenance",
        priority: "High",
        status: "Open",
      },
      {
        id: "MT-102",
        loc: "HQ - Lobby",
        issue: "Printer Service",
        priority: "Normal",
        status: "Pending",
      },
    ];
  }

  async getFacilities() {
    return [
      { id: "1", name: "Main Office", status: "Operational" },
      { id: "2", name: "Satellite Branch", status: "Operational" },
    ];
  }
}
