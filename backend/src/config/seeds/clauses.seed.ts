import { DataSource } from "typeorm";
import {
  Clause,
  ClauseCategory,
  RiskLevel,
} from "../../clauses/entities/clause.entity";

/**
 * Seed sample legal clauses for the clause library
 */
export async function seedClauses(dataSource: DataSource): Promise<void> {
  console.log("Seeding clauses...");

  const clauseRepository = dataSource.getRepository(Clause);

  // Check if clauses already exist
  const existingCount = await clauseRepository.count();
  if (existingCount > 0) {
    console.log("Clauses already seeded, skipping...");
    return;
  }

  const sampleClauses = [
    {
      title: "Standard Confidentiality Clause",
      content: `The Receiving Party agrees to hold in confidence all Confidential Information disclosed by the Disclosing Party. The Receiving Party shall not disclose such information to any third party without the prior written consent of the Disclosing Party, except as required by law or regulation.`,
      description: "Standard mutual NDA confidentiality provision",
      category: ClauseCategory.CONFIDENTIALITY,
      tags: ["NDA", "confidentiality", "standard"],
      riskLevel: RiskLevel.MEDIUM,
      isActive: true,
      isStandard: true,
      practiceArea: "Corporate",
      jurisdiction: "United States",
      usageCount: 45,
    },
    {
      title: "Limitation of Liability - Cap",
      content: `IN NO EVENT SHALL EITHER PARTY'S TOTAL LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT PAID BY CLIENT TO PROVIDER DURING THE TWELVE (12) MONTH PERIOD PRECEDING THE EVENT GIVING RISE TO SUCH LIABILITY.`,
      description: "Standard liability cap provision",
      category: ClauseCategory.LIMITATION_OF_LIABILITY,
      tags: ["liability", "damages", "cap"],
      riskLevel: RiskLevel.HIGH,
      isActive: true,
      isStandard: true,
      practiceArea: "Commercial",
      jurisdiction: "United States",
      usageCount: 38,
    },
    {
      title: "Indemnification - Mutual",
      content: `Each party agrees to indemnify, defend, and hold harmless the other party and its officers, directors, employees, and agents from and against any and all claims, damages, losses, and expenses arising out of or resulting from such party's breach of this Agreement or negligent or willful misconduct.`,
      description: "Mutual indemnification provision",
      category: ClauseCategory.INDEMNIFICATION,
      tags: ["indemnification", "mutual", "liability"],
      riskLevel: RiskLevel.HIGH,
      isActive: true,
      isStandard: true,
      practiceArea: "Commercial",
      jurisdiction: "United States",
      usageCount: 32,
    },
    {
      title: "Termination for Convenience",
      content: `Either party may terminate this Agreement for any reason or no reason upon thirty (30) days' prior written notice to the other party. Upon termination, Client shall pay Provider for all services rendered through the effective date of termination.`,
      description: "Standard termination for convenience clause",
      category: ClauseCategory.TERMINATION,
      tags: ["termination", "convenience", "notice"],
      riskLevel: RiskLevel.MEDIUM,
      isActive: true,
      isStandard: true,
      practiceArea: "Commercial",
      jurisdiction: "United States",
      usageCount: 28,
    },
    {
      title: "Payment Terms - Net 30",
      content: `Client agrees to pay all invoices within thirty (30) days of the invoice date. Late payments shall accrue interest at the rate of 1.5% per month or the maximum rate permitted by law, whichever is less. Provider reserves the right to suspend services for accounts more than sixty (60) days past due.`,
      description: "Standard payment terms with interest",
      category: ClauseCategory.PAYMENT,
      tags: ["payment", "net 30", "interest"],
      riskLevel: RiskLevel.LOW,
      isActive: true,
      isStandard: true,
      practiceArea: "Commercial",
      jurisdiction: "United States",
      usageCount: 42,
    },
    {
      title: "Governing Law - Delaware",
      content: `This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflicts of law provisions. The parties hereby consent to the exclusive jurisdiction of the state and federal courts located in Delaware for any disputes arising under this Agreement.`,
      description: "Delaware governing law and jurisdiction",
      category: ClauseCategory.GOVERNING_LAW,
      tags: ["governing law", "Delaware", "jurisdiction"],
      riskLevel: RiskLevel.LOW,
      isActive: true,
      isStandard: true,
      practiceArea: "Corporate",
      jurisdiction: "Delaware",
      usageCount: 35,
    },
    {
      title: "Arbitration Clause - AAA Rules",
      content: `Any dispute, controversy, or claim arising out of or relating to this Agreement, or the breach thereof, shall be settled by binding arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules. The arbitration shall be conducted by a single arbitrator in New York, New York. Judgment on the award rendered by the arbitrator may be entered in any court having jurisdiction thereof.`,
      description: "Standard AAA arbitration provision",
      category: ClauseCategory.DISPUTE_RESOLUTION,
      tags: ["arbitration", "AAA", "dispute resolution"],
      riskLevel: RiskLevel.MEDIUM,
      isActive: true,
      isStandard: true,
      practiceArea: "Commercial",
      jurisdiction: "United States",
      usageCount: 25,
    },
    {
      title: "Force Majeure",
      content: `Neither party shall be liable for any failure or delay in performance under this Agreement due to causes beyond its reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.`,
      description: "Standard force majeure clause",
      category: ClauseCategory.FORCE_MAJEURE,
      tags: ["force majeure", "excuse", "delay"],
      riskLevel: RiskLevel.MEDIUM,
      isActive: true,
      isStandard: true,
      practiceArea: "Commercial",
      jurisdiction: "United States",
      usageCount: 22,
    },
    {
      title: "Intellectual Property - Work for Hire",
      content: `All work product, deliverables, and intellectual property created by Provider in the course of performing services under this Agreement shall be considered "work made for hire" as defined by the Copyright Act. To the extent such work does not qualify as work made for hire, Provider hereby assigns all right, title, and interest in such work to Client.`,
      description: "Work for hire IP assignment",
      category: ClauseCategory.INTELLECTUAL_PROPERTY,
      tags: ["IP", "work for hire", "assignment"],
      riskLevel: RiskLevel.HIGH,
      isActive: true,
      isStandard: true,
      practiceArea: "Technology",
      jurisdiction: "United States",
      usageCount: 30,
    },
    {
      title: "Assignment and Delegation",
      content: `Neither party may assign or delegate any of its rights or obligations under this Agreement without the prior written consent of the other party, except that either party may assign this Agreement in connection with a merger, acquisition, or sale of all or substantially all of its assets. Any attempted assignment in violation of this provision shall be void.`,
      description: "Standard anti-assignment clause",
      category: ClauseCategory.ASSIGNMENT,
      tags: ["assignment", "delegation", "M&A"],
      riskLevel: RiskLevel.MEDIUM,
      isActive: true,
      isStandard: true,
      practiceArea: "Corporate",
      jurisdiction: "United States",
      usageCount: 20,
    },
  ];

  try {
    for (const clauseData of sampleClauses) {
      const clause = clauseRepository.create(clauseData);
      await clauseRepository.save(clause);
    }

    console.log(`✓ Seeded ${sampleClauses.length} clauses`);
  } catch (error) {
    console.error("Error seeding clauses:", error);
    throw error;
  }
}
